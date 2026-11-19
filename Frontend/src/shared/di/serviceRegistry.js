const DIContainer = require('./container');
const ServiceClusterManager = require('./serviceClusterManager');
const path = require('path');
const fs = require('fs');

// Cargar configuración de servicios
const configPath = path.join(__dirname, 'services.config.json');
const servicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Service Registry para inyección de dependencias
 * 
 * Sistema unificado que maneja cualquier tipo de servicio (Application, Domain, Infrastructure)
 * con las mismas capacidades: factory, singleton, lazy loading, dependencias
 * 
 * Reglas de arquitectura:
 * - Infrastructure → solo puede depender de Infrastructure
 * - Domain → puede depender de Domain, Infrastructure
 * - Application → puede depender de Application, Domain, Infrastructure
 */
class ServiceRegistry {
    constructor(container) {
        this.container = container;
        this.servicesConfig = servicesConfig;
        this.serviceInstances = new Map(); // Cache de instancias de servicios (singletons)
        this.initializingServices = new Set(); // Para detectar dependencias circulares durante la inicialización
        this.clusterManager = new ServiceClusterManager(this); // Manager de clusters
        this.initialize();
    }

    /**
     * Mapeo de tipos de servicio a sus secciones en el config
     */
    getServiceTypeConfig(type) {
        const typeMap = {
            'application': 'services',
            'domain': 'domainServices',
            'infrastructure': 'infrastructureServices'
        };
        return typeMap[type] || type;
    }

    /**
     * Obtiene la configuración de un servicio por tipo
     */
    getServiceConfig(serviceKey, serviceType) {
        const configSection = this.getServiceTypeConfig(serviceType);
        const config = this.servicesConfig[configSection];
        if (!config) {
            throw new Error(`Service type config "${configSection}" not found`);
        }
        const serviceConfig = config[serviceKey];
        if (!serviceConfig) {
            throw new Error(`${serviceType} service "${serviceKey}" not found in config`);
        }
        return { serviceConfig, configSection };
    }

    /**
     * Resuelve un parámetro de factory de forma dinámica
     * - "env:VAR" o "env:VAR||default" -> process.env.VAR o default
     * - "context:path.to.prop"        -> context[path.to.prop]
     * - "service:Key:type"            -> servicio (puede crear dependencias circulares)
     * - "repository:RepoName"         -> repositorio
     * - cualquier otro string         -> se devuelve tal cual
     */
    resolveFactoryParam(param, context, visitedServices = new Set(), currentServiceType = null) {
        if (param == null) return param;
        if (typeof param !== 'string') return param;

        // Servicios desde el propio DI (formato: "service:ServiceKey:type" o "serviceType:ServiceKey")
        if (param.startsWith('service:')) {
            const parts = param.substring('service:'.length).split(':');
            const serviceKey = parts[0];
            const serviceType = parts[1] || 'application';
            return this.getService(serviceKey, serviceType, context, visitedServices);
        }

        // Formatos legacy para compatibilidad
        if (param.startsWith('domainService:')) {
            const serviceKey = param.substring('domainService:'.length);
            if (!serviceKey) return undefined;
            return this.getService(serviceKey, 'domain', context || {}, visitedServices);
        }

        if (param.startsWith('infrastructureService:')) {
            const serviceKey = param.substring('infrastructureService:'.length);
            if (!serviceKey) return undefined;
            return this.getService(serviceKey, 'infrastructure', context || {}, visitedServices);
        }

        if (param.startsWith('applicationService:')) {
            const serviceKey = param.substring('applicationService:'.length);
            if (!serviceKey) return undefined;
            return this.getService(serviceKey, 'application', context || {}, visitedServices);
        }

        // Repositorios desde el propio DI
        if (param.startsWith('repository:')) {
            const repoKey = param.substring('repository:'.length);
            if (!repoKey) return undefined;
            return this.createRepository(repoKey, context);
        }

        // Variables de entorno
        if (param.startsWith('env:')) {
            const defSplit = param.substring(4).split('||');
            const envName = defSplit[0];
            const defaultValue = defSplit[1];
            const value = process.env[envName];
            if (value !== undefined && value !== null && value !== '') {
                return value;
            }
            return defaultValue !== undefined ? defaultValue : undefined;
        }

        // Rutas sobre el context: "context:logger" o "context:user.user_id"
        if (param.startsWith('context:')) {
            const pathStr = param.substring(8);
            if (!pathStr) return undefined;
            return pathStr.split('.').reduce((acc, key) => {
                if (acc && typeof acc === 'object') {
                    return acc[key];
                }
                return undefined;
            }, context);
        }

        // Literal
        return param;
    }

    /**
     * Resuelve una lista de parámetros de factory
     */
    resolveFactoryParams(params = [], context, visitedServices = new Set(), currentServiceType = null) {
        return params.map(p => this.resolveFactoryParam(p, context, visitedServices, currentServiceType));
    }

    /**
     * Valida que un servicio de tipo 'fromType' pueda depender de un servicio de tipo 'toType'
     */
    validateDependencyArchitecture(fromType, toType, fromService, toService) {
        // Infrastructure solo puede depender de Infrastructure
        if (fromType === 'infrastructure' && toType !== 'infrastructure') {
            throw new Error(`Architecture violation: Infrastructure service "${fromService}" cannot depend on ${toType} service "${toService}". Infrastructure can only depend on Infrastructure.`);
        }

        // Domain puede depender de Domain e Infrastructure (no de Application)
        if (fromType === 'domain' && toType === 'application') {
            throw new Error(`Architecture violation: Domain service "${fromService}" cannot depend on application service "${toService}". Domain can only depend on Domain and Infrastructure.`);
        }

        // Application puede depender de cualquier cosa (Application, Domain, Infrastructure)
        // No hay restricciones

        return true;
    }

    initialize() {
        // Registrar singletons sin factory
        // NOTA: Los servicios de aplicación NO se registran aquí porque requieren context
        // que solo está disponible en runtime. Se crearán bajo demanda.
        const serviceTypes = ['domainServices', 'infrastructureServices'];
        serviceTypes.forEach(type => {
            const services = this.servicesConfig[type] || {};
            Object.keys(services).forEach(serviceKey => {
                const serviceConfig = services[serviceKey];
                if (serviceConfig.singleton && !serviceConfig.factory) {
                    try {
                        const ServiceClass = require(serviceConfig.path);
                        const ClassToRegister = serviceConfig.class === 'default' ? ServiceClass : ServiceClass[serviceConfig.class];
                        // Los servicios de dominio e infraestructura no necesitan context en el constructor
                        this.container.register(serviceKey, ClassToRegister, [], true);
                    } catch (error) {
                        console.error(`[ServiceRegistry] Failed to register singleton ${serviceKey} of type ${type}:`, error.message);
                    }
                }
            });
        });
    }

    /**
     * Crea un repositorio con sql.query del context
     */
    createRepository(repositoryKey, context) {
        const repoConfig = this.servicesConfig.repositories[repositoryKey];
        if (!repoConfig) {
            throw new Error(`Repository ${repositoryKey} not found in config`);
        }

        // Validar context si es requerido
        if (repoConfig.requiresContext && repoConfig.requiresContext.includes('sql.query')) {
            if (!context || typeof context !== 'object') {
                throw new Error(`Repository ${repositoryKey} requires context with sql.query, but context is ${context === undefined ? 'undefined' : typeof context}`);
            }
            if (!context.sql || !context.sql.query) {
                throw new Error(`Repository ${repositoryKey} requires context.sql.query, but it's not available in context`);
            }
        }

        const RepositoryClass = require(repoConfig.path);
        const ClassToUse = repoConfig.class === 'default' ? RepositoryClass : RepositoryClass[repoConfig.class];
        
        // Obtener sql.query del context (ya validado arriba)
        const sqlQuery = repoConfig.requiresContext && repoConfig.requiresContext.includes('sql.query') ? context.sql.query : null;
        
        return new ClassToUse(sqlQuery);
    }

    /**
     * Método genérico unificado para obtener o crear cualquier tipo de servicio
     * @param {string} serviceKey - Clave del servicio
     * @param {string} serviceType - Tipo: 'application', 'domain', 'infrastructure'
     * @param {Object} context - Contexto con sql.query, user, logger, execute, etc.
     * @param {Set} visitedServices - Set de servicios visitados para detectar dependencias circulares
     * @returns {*} Instancia del servicio
     */
    getService(serviceKey, serviceType, context, visitedServices = new Set()) {
        try {
            // Asegurar que context siempre sea un objeto (siempre inicializar a objeto vacío si no viene)
            if (context === undefined || context === null) {
                context = {};
            }

            const { serviceConfig } = this.getServiceConfig(serviceKey, serviceType);
            // Si es singleton sin factory, manejar según tipo
            if (serviceConfig.singleton && !serviceConfig.factory) {
                // Los servicios de aplicación singletons NO se registran en el container
                // porque requieren context que solo está disponible en runtime
                // Se crean directamente aquí con el context disponible
                if (serviceType === 'application') {
                    // Validar context
                    if (!context || typeof context !== 'object') {
                        throw new Error(
                            `Cannot get application service singleton "${serviceKey}": context is required but received ${context === undefined ? 'undefined' : context === null ? 'null' : typeof context}`
                        );
                    }
                    // Verificar cache primero
                    const cacheKey = this.getServiceCacheKey(serviceKey, serviceType, context);
                    if (this.serviceInstances.has(cacheKey)) {
                        return this.serviceInstances.get(cacheKey);
                    }
                    // Crear instancia directamente con context
                    const ServiceClass = require(serviceConfig.path);
                    const ClassToUse = serviceConfig.class === 'default' ? ServiceClass : ServiceClass[serviceConfig.class];
                    const instance = new ClassToUse({ context });
                    // Cachear
                    this.serviceInstances.set(cacheKey, instance);
                    // Inyectar dependencias
                    this.injectDependencies(instance, serviceConfig.dependencies || {}, serviceKey, serviceType, context, visitedServices);
                    return instance;
                } else {
                    // Servicios de dominio e infraestructura pueden usar el container
                    // No necesitan context en el constructor
                    try {
                        return this.container.get(serviceKey, context || undefined);
                    } catch (error) {
                        throw new Error(`Error getting singleton service ${serviceKey} of type ${serviceType}: ${error.message}`);
                    }
                }
            }

            // Si es singleton, verificar cache primero (para servicios con factory)
            if (serviceConfig.singleton) {
                const cacheKey = this.getServiceCacheKey(serviceKey, serviceType, context);
                if (this.serviceInstances.has(cacheKey)) {
                    return this.serviceInstances.get(cacheKey);
                }
            }

            // Detectar dependencias circulares
            const serviceId = `${serviceType}:${serviceKey}`;
            if (visitedServices.has(serviceId)) {
                // Permitir dependencias circulares entre singletons (se resuelven con cache)
                if (serviceConfig.singleton) {
                    // Crear instancia parcial primero
                    const instance = this.createServiceInstance(
                        serviceKey,
                        serviceType,
                        serviceConfig,
                        context,
                        visitedServices,
                        true
                    );

                    // Cachear la instancia parcial antes de inyectar dependencias
                    const cacheKey = this.getServiceCacheKey(serviceKey, serviceType, context);
                    this.serviceInstances.set(cacheKey, instance);

                    // Remover del visitedServices temporalmente
                    visitedServices.delete(serviceId);

                    // Inyectar dependencias (puede incluir el servicio que está creando, pero ya está en cache)
                    this.injectDependencies(
                        instance,
                        serviceConfig.dependencies || {},
                        serviceKey,
                        serviceType,
                        context,
                        visitedServices
                    );

                    return instance;
                }
                // Si no es singleton, lanzar error
                const cycle = Array.from(visitedServices).join(' -> ') + ' -> ' + serviceId;
                throw new Error(`Circular dependency detected: ${cycle}`);
            }

            visitedServices.add(serviceId);

            // Crear instancia del servicio
            const instance = this.createServiceInstance(
                serviceKey,
                serviceType,
                serviceConfig,
                context,
                visitedServices,
                false
            );
            // Inyectar dependencias
            this.injectDependencies(
                instance,
                serviceConfig.dependencies || {},
                serviceKey,
                serviceType,
                context,
                visitedServices
            );

            // Si es singleton, cachear la instancia
            if (serviceConfig.singleton) {
                const cacheKey = this.getServiceCacheKey(serviceKey, serviceType, context);
                this.serviceInstances.set(cacheKey, instance);
            }

            // Remover del set de visitados
            visitedServices.delete(serviceId);

            return instance;
        }
        catch (error) {
            console.error(`[ServiceRegistry] Error getting service ${serviceKey}:`, error.message);
            throw error;
        }
    }

    /**
     * Crea una instancia del servicio (con o sin factory)
     */
    createServiceInstance(serviceKey, serviceType, serviceConfig, context, visitedServices, isPartial = false) {
        try {
            // Si tiene factory, usar factory
            if (serviceConfig.factory) {
                return this.createServiceWithFactory(serviceKey, serviceType, serviceConfig, context, visitedServices);
            }

            // Si no tiene factory, crear instancia directa
            const ServiceClass = require(serviceConfig.path);
            let ClassToUse;
            
            if (serviceConfig.class === 'default') {
                // Si es default, usar la exportación principal del módulo
                ClassToUse = ServiceClass;
            } else {
                // Si hay un nombre de clase específico, buscar en las propiedades del módulo
                // o usar el módulo directamente si es una función/clase
                if (typeof ServiceClass === 'function' && ServiceClass.name === serviceConfig.class) {
                    // El módulo exporta directamente la clase con el nombre especificado
                    ClassToUse = ServiceClass;
                } else if (ServiceClass[serviceConfig.class]) {
                    // La clase está como propiedad del módulo
                    ClassToUse = ServiceClass[serviceConfig.class];
                } else {
                    // Si no se encuentra, intentar usar el módulo directamente si es una función
                    ClassToUse = typeof ServiceClass === 'function' ? ServiceClass : null;
                }
            }
            
            if (!ClassToUse || typeof ClassToUse !== 'function') {
                throw new Error(
                    `Cannot create service "${serviceKey}": Class "${serviceConfig.class || 'default'}" not found or is not a constructor in module ${serviceConfig.path}. ` +
                    `Module exports: ${typeof ServiceClass === 'function' ? `function ${ServiceClass.name}` : typeof ServiceClass}`
                );
            }

            // Para servicios de aplicación, pasar context como objeto
            // Validar que context exista y sea un objeto válido
            if (serviceType === 'application' && !isPartial) {
                if (context === undefined || context === null) {
                    throw new Error(
                        `Cannot create application service "${serviceKey}": context is required but received ${context === undefined ? 'undefined' : 'null'}. ` +
                        `Application services require a context object with properties like logger, user, sql, etc. ` +
                        `Make sure you are passing a valid context object when creating this service.`
                    );
                }
                if (typeof context !== 'object') {
                    throw new Error(
                        `Cannot create application service "${serviceKey}": context must be an object but received ${typeof context}. ` +
                        `Received value: ${JSON.stringify(context)}`
                    );
                }
                // Asegurar que siempre pasamos un objeto válido (incluso si está vacío, aunque debería tener propiedades)
                return new ClassToUse({ context });
            }

            return new ClassToUse();
        }
        catch (error) {
            console.error(`[ServiceRegistry] Error creating service instance for ${serviceKey}:`, error.message);
            throw error;
        }
    }

    /**
     * Crea un servicio usando factory (constructor o función factory)
     */
    createServiceWithFactory(serviceKey, serviceType, serviceConfig, context, visitedServices) {
        try {
            const factoryName = serviceConfig.factory;
            const factoryParams = serviceConfig.factoryParams || [];
    
            if (context && context.logger) {
                context.logger.debug(`[ServiceRegistry] Creating ${serviceType} service with factory: ${serviceKey} from ${serviceConfig.path}`);
            }
    
            // Resolver parámetros de factory
            let resolvedParams;
            try {
                resolvedParams = this.resolveFactoryParams(factoryParams, context, visitedServices, serviceType);
            } catch (error) {
                throw new Error(`Failed to resolve factory params for ${serviceKey}: ${error.message}`);
            }
    
            // Cargar módulo y clase
            let moduleExports;
            try {
                const resolvedPath = path.resolve(__dirname, serviceConfig.path);
                try {
                    moduleExports = require(resolvedPath);
                } catch (requireError) {
                    moduleExports = require(serviceConfig.path);
                }
            } catch (error) {
                throw new Error(`Failed to require module for ${serviceKey} at path ${serviceConfig.path}: ${error.message}`);
            }
    
            const TargetClassOrModule = serviceConfig.class === 'default'
                ? moduleExports
                : moduleExports[serviceConfig.class];
    
            if (!TargetClassOrModule) {
                throw new Error(`Class "${serviceConfig.class || 'default'}" not found in module ${serviceConfig.path} for ${serviceKey}`);
            }
    
            if (typeof TargetClassOrModule !== 'function') {
                throw new Error(`Class "${serviceConfig.class || 'default'}" in module ${serviceConfig.path} is not a constructor for ${serviceKey}`);
            }
    
            // Si no se define factory o es "constructor", usar new Class(...params)
            if (!factoryName || factoryName === 'constructor') {
                try {
                    return new TargetClassOrModule(...resolvedParams);
                } catch (error) {
                    throw new Error(`Failed to instantiate ${serviceKey} with constructor: ${error.message}`);
                }
            }
    
            // Si factoryName refiere a una función exportada, llamarla
            const factoryFn = moduleExports[factoryName];
            if (typeof factoryFn === 'function') {
                try {
                    return factoryFn(...resolvedParams);
                } catch (error) {
                    throw new Error(`Failed to call factory ${factoryName} for ${serviceKey}: ${error.message}`);
                }
            }
    
            throw new Error(`Service factory ${factoryName} not found in module ${serviceConfig.path} for ${serviceKey}`);
        }
        catch (error) {
            console.error(`[ServiceRegistry] Error creating service with factory for ${serviceKey}:`, error.message);
            throw error;
        }
    }

    /**
     * Genera una clave de cache para un servicio
     */
    getServiceCacheKey(serviceKey, serviceType, context) {
        context = context || {};
        const userId = context.user && context.user.user_id ? context.user.user_id : 'anonymous';
        return `${serviceType}:${serviceKey}:${userId}`;
    }

    /**
     * Inyecta dependencias en el servicio (método unificado)
     * Valida reglas de arquitectura y maneja lazy loading
     */
    injectDependencies(service, dependencies, serviceKey, serviceType, context, visitedServices) {
        // Validar context básico
        if (!context || typeof context !== 'object') {
            // Si no hay context, crear objeto vacío pero registrar advertencia para servicios que lo necesiten
            context = {};
            // Los servicios de aplicación requieren context válido, se validará al intentar crearlos
        }

        // Inyectar repositorios (todos los tipos pueden tener repositorios)
        if (dependencies.repositories && dependencies.repositories.length > 0) {
            dependencies.repositories.forEach(repoKey => {
                const repository = this.createRepository(repoKey, context);
                const propertyName = this.toCamelCase(repoKey.replace('Repository', '') + 'Repository');
                service[propertyName] = repository;
            });
        }

        // Inyectar servicios de dominio
        if (dependencies.domainServices && dependencies.domainServices.length > 0) {
            dependencies.domainServices.forEach(domainServiceKey => {
                // Validar arquitectura
                this.validateDependencyArchitecture(serviceType, 'domain', serviceKey, domainServiceKey);
                
                // Si es un string, obtener el servicio
                if (typeof domainServiceKey === 'string') {
                    try {
                        const domainService = this.getService(domainServiceKey, 'domain', context, visitedServices);
                        const propertyName = this.toCamelCase(domainServiceKey.replace('DomainService', '') + 'DomainService');
                        service[propertyName] = domainService;
                    } catch (error) {
                        throw new Error(`Failed to inject domain service "${domainServiceKey}" into "${serviceKey}": ${error.message}`);
                    }
                } else {
                    // Si es un objeto con config de factory (domainServicesWithFactory)
                    try {
                        // Obtener la configuración completa del servicio de dominio
                        const { serviceConfig: domainServiceConfig } = this.getServiceConfig(domainServiceKey.name, 'domain');
                        
                        // Crear una config temporal que combine la config completa con los factoryParams del config
                        const combinedConfig = {
                            ...domainServiceConfig,
                            factory: domainServiceKey.factory || domainServiceConfig.factory || 'constructor',
                            factoryParams: domainServiceKey.factoryParams || domainServiceConfig.factoryParams || []
                        };
                        
                        const domainService = this.createServiceWithFactory(
                            domainServiceKey.name, 
                            'domain', 
                            combinedConfig, 
                            context, 
                            visitedServices
                        );
                        const propertyName = this.toCamelCase(domainServiceKey.name.replace('DomainService', '') + 'DomainService');
                        service[propertyName] = domainService;
                    } catch (error) {
                        throw new Error(`Failed to inject domain service "${domainServiceKey.name}" into "${serviceKey}": ${error.message}`);
                    }
                }
            });
        }

        // Inyectar servicios de aplicación
        if (dependencies.applicationServices && dependencies.applicationServices.length > 0) {
            dependencies.applicationServices.forEach(appServiceKey => {
                // Validar arquitectura
                this.validateDependencyArchitecture(serviceType, 'application', serviceKey, appServiceKey);
                
                // Validar que context existe y es un objeto válido para servicios de aplicación
                if (context === undefined || context === null) {
                    throw new Error(
                        `Cannot inject application service "${appServiceKey}" into "${serviceKey}": context is required but received ${context === undefined ? 'undefined' : 'null'}. ` +
                        `Application services require a valid context object with properties like logger, user, sql, etc.`
                    );
                }
                if (typeof context !== 'object') {
                    throw new Error(
                        `Cannot inject application service "${appServiceKey}" into "${serviceKey}": context must be an object but received ${typeof context}.`
                    );
                }
                
                try {
                    // Verificar si el servicio pertenece a algún cluster
                    // Si es así, NO crearlo aquí (debe crearse a través del cluster)
                    const belongsToCluster = this.clusterManager.belongsToAnyCluster(appServiceKey);
                    if (belongsToCluster) {
                        // Si el servicio pertenece a un cluster, crear un getter lazy que lo obtenga del cluster
                        // Esto evita dependencias circulares porque el getter se resuelve solo cuando se accede
                        const propertyName = this.toCamelCase(appServiceKey.replace('Service', '') + 'Service');
                        const clusterName = belongsToCluster;
                        const registryRef = this;
                        Object.defineProperty(service, propertyName, {
                            get: function() {
                                // Obtener el cluster y luego el servicio del cluster
                                const cluster = registryRef.clusterManager.getCluster(clusterName, context);
                                return cluster.getService(appServiceKey);
                            },
                            configurable: true,
                            enumerable: true
                        });
                    } else {
                        // Si no pertenece a un cluster, obtenerlo normalmente
                        const appService = this.getService(appServiceKey, 'application', context, visitedServices);
                        const propertyName = this.toCamelCase(appServiceKey.replace('Service', '') + 'Service');
                        service[propertyName] = appService;
                    }
                } catch (error) {
                    throw new Error(`Failed to inject application service "${appServiceKey}" into "${serviceKey}": ${error.message}`);
                }
            });
        }

        // Inyectar servicios de infraestructura
        if (dependencies.infrastructureServices && dependencies.infrastructureServices.length > 0) {
            dependencies.infrastructureServices.forEach(infraServiceKey => {
                // Validar arquitectura
                this.validateDependencyArchitecture(serviceType, 'infrastructure', serviceKey, infraServiceKey);
                
                const { serviceConfig: infraServiceConfig } = this.getServiceConfig(infraServiceKey, 'infrastructure');
                const propertyName = this.toCamelCase(infraServiceKey);

                // Lazy loading por defecto si está configurado
                if (infraServiceConfig.lazy !== false) {
                    const registryRef = this;
                    const infraServiceKeyRef = infraServiceKey;
                    const contextRef = context;
                    
                    Object.defineProperty(service, propertyName, {
                        get: function() {
                            const privateProp = `_${propertyName}_instance`;
                            if (!this[privateProp]) {
                                try {
                                    this[privateProp] = registryRef.getService(infraServiceKeyRef, 'infrastructure', contextRef, new Set());
                                } catch (error) {
                                    if (infraServiceConfig.optional === true) {
                                        if (contextRef.logger) {
                                            contextRef.logger.warn(`[ServiceRegistry] Optional infrastructure service ${infraServiceKeyRef} not available: ${error.message}`);
                                        }
                                        this[privateProp] = null;
                                    } else {
                                        throw error;
                                    }
                                }
                            }
                            return this[privateProp];
                        },
                        configurable: true,
                        enumerable: true
                    });
                } else {
                    // Crear inmediatamente
                    try {
                        service[propertyName] = this.getService(infraServiceKey, 'infrastructure', context, visitedServices);
                    } catch (error) {
                        if (infraServiceConfig.optional === true) {
                            service[propertyName] = null;
                            if (context.logger) {
                                context.logger.warn(`[ServiceRegistry] Optional infrastructure service ${infraServiceKey} not available: ${error.message}`);
                            }
                        } else {
                            throw error;
                        }
                    }
                }
            });
        }

        // Inyectar managers (solo para servicios de aplicación) - LAZY LOADING
        if (dependencies.managers && dependencies.managers.length > 0 && serviceType === 'application') {
            // Validar context para managers
            if (!context || typeof context !== 'object') {
                throw new Error(
                    `Cannot create managers for service "${serviceKey}": context is required but received ${context === undefined ? 'undefined' : typeof context}. ` +
                    `Managers require a context object.`
                );
            }
            
            if (!service.managers) {
                service.managers = {};
            }
            
            const registryRef = this;
            const serviceRef = service;
            const contextRef = context;
            const visitedServicesRef = visitedServices;
            
            dependencies.managers.forEach(managerConfig => {
                // Crear getter lazy para cada manager
                Object.defineProperty(service.managers, managerConfig.name, {
                    get: function() {
                        const privateProp = `_${managerConfig.name}_instance`;
                        if (!serviceRef[privateProp]) {
                            try {
                                if (contextRef.logger) {
                                    contextRef.logger.debug(`[ServiceRegistry] Lazy loading manager: ${managerConfig.name} from path: ${managerConfig.path}`);
                                }
                                
                                const managerPath = path.resolve(__dirname, managerConfig.path);
                                let ManagerClass;
                                try {
                                    ManagerClass = require(managerPath);
                                } catch (requireError) {
                                    ManagerClass = require(managerConfig.path);
                                }
                                
                                const ClassToUse = managerConfig.class === 'default' ? ManagerClass : ManagerClass[managerConfig.class];
                                
                                const managerConstructorParams = {
                                    context: contextRef,
                                    parentService: serviceRef,
                                    executor: contextRef.execute || null
                                };
                                
                                // Pre-resolver servicios de aplicación que el manager necesita en su constructor
                                if (managerConfig.dependencies && managerConfig.dependencies.applicationServices) {
                                    if (managerConfig.name === 'data') {
                                        managerConfig.dependencies.applicationServices.forEach(appServiceKey => {
                                            const appService = registryRef.getService(appServiceKey, 'application', contextRef, visitedServicesRef);
                                            const paramName = registryRef.toCamelCase(appServiceKey.replace('Service', '') + 'Service');
                                            managerConstructorParams[paramName] = appService;
                                        });
                                    }
                                }
                                
                                const managerInstance = new ClassToUse(managerConstructorParams);
                                
                                // Inyectar dependencias del manager
                                if (managerConfig.dependencies) {
                                    registryRef.injectDependencies(managerInstance, managerConfig.dependencies, managerConfig.name, 'application', contextRef, visitedServicesRef);
                                }
                                
                                serviceRef[privateProp] = managerInstance;
                            } catch (error) {
                                const errorMessage = `Error creating manager "${managerConfig.name}" at path "${managerConfig.path}": ${error.message}`;
                                if (contextRef.logger) {
                                    contextRef.logger.error(`[ServiceRegistry] ${errorMessage}`, error);
                                }
                                throw new Error(errorMessage);
                            }
                        }
                        return serviceRef[privateProp];
                    },
                    configurable: true,
                    enumerable: true
                });
            });
        }
    }

    /**
     * Métodos legacy para compatibilidad hacia atrás
     */
    getDomainService(serviceKey, context = null) {
        // Domain services singletons no necesitan contexto
        return this.getService(serviceKey, 'domain', context || {}, new Set());
    }

    getInfrastructureService(serviceKey, context = null, visitedServices = new Set()) {
        return this.getService(serviceKey, 'infrastructure', context || {}, visitedServices);
    }

    createApplicationService(serviceKey, context, visitedServices = new Set()) {
        return this.getService(serviceKey, 'application', context, visitedServices);
    }

    createDomainServiceWithFactory(domainServiceConfig, context) {
        return this.createServiceWithFactory(
            domainServiceConfig.name,
            'domain',
            domainServiceConfig,
            context,
            new Set()
        );
    }

    /**
     * Convierte PascalCase a camelCase
     */
    toCamelCase(str) {
        if (!str) return str;
        const COMMON_PREFIXES = ['WS', 'API', 'HTTP', 'XML', 'DB', 'CSV', 'PDF', 'JSON'];
        for (const prefix of COMMON_PREFIXES) {
            if (str.startsWith(prefix) && str.length > prefix.length && /[A-Z]/.test(str[prefix.length])) {
                return prefix.toLowerCase() + str.slice(prefix.length);
            }
        }
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    /**
     * Obtiene un cluster de servicios
     * @param {string} clusterName - Nombre del cluster
     * @param {Object} context - Contexto con sql.query, user, logger, etc.
     * @returns {Object} Instancia del cluster con acceso lazy a servicios
     */
    getCluster(clusterName, context) {
        return this.clusterManager.getCluster(clusterName, context);
    }
}

// Crear instancia singleton del container y registry
const container = new DIContainer();
const serviceRegistry = new ServiceRegistry(container);

module.exports = {
    container,
    serviceRegistry
};
