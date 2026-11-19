const path = require('path');
const fs = require('fs');

/**
 * Service Cluster Manager
 * 
 * Gestiona clusters de servicios de aplicación que comparten dependencias comunes
 * y pueden interactuar entre sí de forma lazy, evitando dependencias circulares
 * y problemas de rendimiento.
 * 
 * Características:
 * - Lazy loading: Los servicios se cargan solo cuando se necesitan
 * - Dependencias compartidas: Dependencias comunes del cluster se inyectan una vez
 * - Dependencias particulares: Cada servicio puede tener dependencias adicionales
 * - Sin dependencias circulares: Detección y resolución automática
 * - Interacción entre servicios: Los servicios del cluster pueden acceder entre sí
 */
class ServiceClusterManager {
    constructor(serviceRegistry) {
        this.serviceRegistry = serviceRegistry;
        this.clusterInstances = new Map(); // Cache de instancias de clusters por context
        this.clusterConfigs = new Map(); // Configuraciones de clusters cargadas
    }

    /**
     * Obtiene o crea un cluster de servicios
     * @param {string} clusterName - Nombre del cluster
     * @param {Object} context - Contexto con sql.query, user, logger, etc.
     * @returns {Object} Instancia del cluster con acceso lazy a servicios
     */
    getCluster(clusterName, context) {
        if (!context || typeof context !== 'object') {
            throw new Error(
                `Cannot get cluster "${clusterName}": context is required but received ${context === undefined ? 'undefined' : typeof context}`
            );
        }

        // Generar clave de cache para el cluster
        const cacheKey = this.getClusterCacheKey(clusterName, context);
        
        // Si ya existe, retornarlo
        if (this.clusterInstances.has(cacheKey)) {
            return this.clusterInstances.get(cacheKey);
        }

        // Obtener configuración del cluster
        const clusterConfig = this.getClusterConfig(clusterName);
        
        // Crear instancia del cluster con lazy loading
        const clusterInstance = this.createClusterInstance(clusterName, clusterConfig, context);
        
        // Cachear la instancia
        this.clusterInstances.set(cacheKey, clusterInstance);
        
        return clusterInstance;
    }

    /**
     * Verifica si un servicio pertenece a algún cluster
     * @param {string} serviceKey - Clave del servicio
     * @returns {string|null} Nombre del cluster si pertenece a uno, null si no
     */
    belongsToAnyCluster(serviceKey) {
        // Cargar configuración de clusters
        const configPath = path.join(__dirname, 'services.config.json');
        const servicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (!servicesConfig.clusters) {
            return null;
        }
        
        // Buscar en todos los clusters
        for (const [clusterName, clusterConfig] of Object.entries(servicesConfig.clusters)) {
            if (clusterConfig.services && clusterConfig.services.includes(serviceKey)) {
                return clusterName;
            }
        }
        
        return null;
    }

    /**
     * Obtiene la configuración de un cluster desde services.config.json
     */
    getClusterConfig(clusterName) {
        // Si ya está en cache, retornarlo
        if (this.clusterConfigs.has(clusterName)) {
            return this.clusterConfigs.get(clusterName);
        }

        // Cargar configuración desde services.config.json
        const configPath = path.join(__dirname, 'services.config.json');
        const servicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (!servicesConfig.clusters || !servicesConfig.clusters[clusterName]) {
            throw new Error(`Cluster "${clusterName}" not found in services.config.json`);
        }

        const clusterConfig = servicesConfig.clusters[clusterName];
        
        // Validar configuración
        this.validateClusterConfig(clusterName, clusterConfig);
        
        // Cachear configuración
        this.clusterConfigs.set(clusterName, clusterConfig);
        
        return clusterConfig;
    }

    /**
     * Valida la configuración de un cluster
     */
    validateClusterConfig(clusterName, config) {
        if (!config.services || !Array.isArray(config.services) || config.services.length === 0) {
            throw new Error(`Cluster "${clusterName}" must have at least one service in "services" array`);
        }

        // Validar que todos los servicios existen en la configuración
        const configPath = path.join(__dirname, 'services.config.json');
        const servicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.services.forEach(serviceKey => {
            if (!servicesConfig.services || !servicesConfig.services[serviceKey]) {
                throw new Error(
                    `Cluster "${clusterName}" references service "${serviceKey}" which does not exist in services.config.json`
                );
            }
        });
    }

    /**
     * Crea una instancia del cluster con lazy loading de servicios
     */
    createClusterInstance(clusterName, clusterConfig, context) {
        const registryRef = this.serviceRegistry;
        const clusterNameRef = clusterName;
        const contextRef = context;
        
        // Crear objeto cluster que expone servicios de forma lazy
        const cluster = {
            _name: clusterName,
            _context: context,
            _services: new Map(), // Cache de servicios ya instanciados
            _sharedDependencies: null, // Dependencias compartidas (se inicializan lazy)
            _initialized: false
        };

        // Inicializar dependencias compartidas de forma lazy
        Object.defineProperty(cluster, '_initSharedDependencies', {
            value: function() {
                if (this._sharedDependencies !== null) {
                    return this._sharedDependencies;
                }

                const sharedDeps = {};
                
                // Inyectar dependencias compartidas del cluster
                if (clusterConfig.sharedDependencies) {
                    // Repositorios compartidos
                    if (clusterConfig.sharedDependencies.repositories) {
                        clusterConfig.sharedDependencies.repositories.forEach(repoKey => {
                            sharedDeps[registryRef.toCamelCase(repoKey.replace('Repository', '') + 'Repository')] = 
                                registryRef.createRepository(repoKey, contextRef);
                        });
                    }

                    // Servicios de dominio compartidos
                    if (clusterConfig.sharedDependencies.domainServices) {
                        clusterConfig.sharedDependencies.domainServices.forEach(domainServiceKey => {
                            const domainService = registryRef.getService(domainServiceKey, 'domain', contextRef, new Set());
                            sharedDeps[registryRef.toCamelCase(domainServiceKey.replace('DomainService', '') + 'DomainService')] = 
                                domainService;
                        });
                    }

                    // Servicios de aplicación compartidos
                    // NOTA: Los servicios del cluster NO se inyectan aquí para evitar dependencias circulares
                    // Se inyectan como getters lazy cuando se necesitan
                    if (clusterConfig.sharedDependencies.applicationServices) {
                        clusterConfig.sharedDependencies.applicationServices.forEach(appServiceKey => {
                            // Si es un servicio del cluster, NO inyectarlo aquí (se inyectará como lazy)
                            if (clusterConfig.services.includes(appServiceKey)) {
                                return;
                            }
                            // Solo inyectar servicios fuera del cluster
                            const appService = registryRef.getService(appServiceKey, 'application', contextRef, new Set());
                            sharedDeps[registryRef.toCamelCase(appServiceKey.replace('Service', '') + 'Service')] = 
                                appService;
                        });
                    }

                    // Servicios de infraestructura compartidos
                    if (clusterConfig.sharedDependencies.infrastructureServices) {
                        clusterConfig.sharedDependencies.infrastructureServices.forEach(infraServiceKey => {
                            const infraService = registryRef.getService(infraServiceKey, 'infrastructure', contextRef, new Set());
                            sharedDeps[registryRef.toCamelCase(infraServiceKey)] = infraService;
                        });
                    }
                }

                this._sharedDependencies = sharedDeps;
                return sharedDeps;
            },
            writable: false,
            configurable: false
        });

        // Crear getters lazy para cada servicio del cluster
        const clusterManager = this; // Referencia al manager para usar en los getters
        clusterConfig.services.forEach(serviceKey => {
            const serviceKeyRef = serviceKey;
            
            Object.defineProperty(cluster, registryRef.toCamelCase(serviceKey.replace('Service', '') + 'Service'), {
                get: function() {
                    // Si ya está instanciado, retornarlo
                    if (this._services.has(serviceKeyRef)) {
                        return this._services.get(serviceKeyRef);
                    }

                    try {
                        // Inicializar dependencias compartidas si no están inicializadas
                        const sharedDeps = this._initSharedDependencies();

                        // Crear instancia parcial del servicio (sin dependencias del cluster aún)
                        // Esto permite resolver dependencias circulares porque la instancia ya está en cache
                        const { serviceConfig } = registryRef.getServiceConfig(serviceKeyRef, 'application');
                        const serviceInstance = registryRef.createServiceInstance(
                            serviceKeyRef,
                            'application',
                            serviceConfig,
                            contextRef,
                            new Set(),
                            false
                        );

                        // CACHEAR LA INSTANCIA PARCIAL INMEDIATAMENTE (antes de inyectar dependencias del cluster)
                        // Esto permite que si hay dependencias circulares, el servicio ya esté disponible
                        this._services.set(serviceKeyRef, serviceInstance);

                        // Ahora inyectar todas las dependencias (incluyendo servicios del cluster como lazy)
                        clusterManager._injectDependenciesInCluster(
                            serviceInstance,
                            serviceKeyRef,
                            clusterConfig,
                            contextRef,
                            sharedDeps,
                            registryRef,
                            this // Pasar el cluster instance
                        );
                        
                        return serviceInstance;
                    } catch (error) {
                        // Si hay error, remover del cache para permitir reintento
                        this._services.delete(serviceKeyRef);
                        const errorMessage = `Error creating service "${serviceKeyRef}" in cluster "${clusterNameRef}": ${error.message}`;
                        if (contextRef.logger) {
                            contextRef.logger.error(`[ServiceClusterManager] ${errorMessage}`, error);
                        }
                        throw new Error(errorMessage);
                    }
                },
                configurable: true,
                enumerable: true
            });
        });

        // Método para obtener un servicio por nombre (útil para acceso dinámico)
        cluster.getService = function(serviceKey) {
            const propertyName = registryRef.toCamelCase(serviceKey.replace('Service', '') + 'Service');
            if (!this.hasOwnProperty(propertyName)) {
                throw new Error(`Service "${serviceKey}" is not part of cluster "${clusterNameRef}"`);
            }
            return this[propertyName];
        };

        // Método para listar servicios disponibles en el cluster
        cluster.getAvailableServices = function() {
            return clusterConfig.services;
        };

        return cluster;
    }

    /**
     * Inyecta dependencias en un servicio del cluster
     * Separa la lógica de inyección de la creación para permitir cachear instancias parciales
     */
    _injectDependenciesInCluster(serviceInstance, serviceKey, clusterConfig, context, sharedDeps, registryRef, clusterInstance) {
        // Obtener configuración del servicio
        const { serviceConfig } = registryRef.getServiceConfig(serviceKey, 'application');
        const serviceDependencies = serviceConfig.dependencies || {};
        const sharedDepsConfig = clusterConfig.sharedDependencies || {};
        
        // PASO 1: Inyectar PRIMERO los servicios del cluster como lazy (ANTES de cualquier otra dependencia)
        // Esto evita dependencias circulares porque los getters lazy se resuelven solo cuando se acceden
        if (serviceDependencies.applicationServices) {
            serviceDependencies.applicationServices.forEach(appServiceKey => {
                // Si es un servicio del cluster, crear getter lazy INMEDIATAMENTE
                if (clusterConfig.services.includes(appServiceKey)) {
                    const propertyName = registryRef.toCamelCase(appServiceKey.replace('Service', '') + 'Service');
                    // Solo crear el getter si no existe ya
                    if (!serviceInstance.hasOwnProperty(propertyName)) {
                        Object.defineProperty(serviceInstance, propertyName, {
                            get: function() {
                                return clusterInstance.getService(appServiceKey);
                            },
                            configurable: true,
                            enumerable: true
                        });
                    }
                }
            });
        }

        // PASO 2: Inyectar dependencias compartidas (solo las que NO son servicios del cluster)
        Object.keys(sharedDeps).forEach(propName => {
            // Solo inyectar si no es un servicio del cluster (ya están como lazy arriba)
            const isClusterService = serviceDependencies.applicationServices && 
                serviceDependencies.applicationServices.some(svc => {
                    const svcPropName = registryRef.toCamelCase(svc.replace('Service', '') + 'Service');
                    return svcPropName === propName && clusterConfig.services.includes(svc);
                });
            if (!isClusterService && !serviceInstance.hasOwnProperty(propName)) {
                serviceInstance[propName] = sharedDeps[propName];
            }
        });
        
        // Repositorios particulares
        if (serviceDependencies.repositories) {
            const particularRepos = serviceDependencies.repositories.filter(
                repoKey => !(sharedDepsConfig.repositories || []).includes(repoKey)
            );
            particularRepos.forEach(repoKey => {
                const repository = registryRef.createRepository(repoKey, context);
                const propertyName = registryRef.toCamelCase(repoKey.replace('Repository', '') + 'Repository');
                serviceInstance[propertyName] = repository;
            });
        }

        // Servicios de dominio particulares
        if (serviceDependencies.domainServices) {
            const particularDomainServices = serviceDependencies.domainServices.filter(
                domainServiceKey => !(sharedDepsConfig.domainServices || []).includes(domainServiceKey)
            );
            particularDomainServices.forEach(domainServiceKey => {
                const domainService = registryRef.getService(domainServiceKey, 'domain', context, new Set());
                const propertyName = registryRef.toCamelCase(domainServiceKey.replace('DomainService', '') + 'DomainService');
                serviceInstance[propertyName] = domainService;
            });
        }

        // PASO 3: Inyectar servicios de aplicación que NO son del cluster
        // (Los servicios del cluster ya fueron inyectados como lazy en el PASO 1)
        if (serviceDependencies.applicationServices) {
            serviceDependencies.applicationServices.forEach(appServiceKey => {
                const propertyName = registryRef.toCamelCase(appServiceKey.replace('Service', '') + 'Service');
                
                // Si es un servicio del cluster, ya fue inyectado como lazy en el PASO 1, saltar
                if (clusterConfig.services.includes(appServiceKey)) {
                    return;
                }
                
                // Si no es del cluster, verificar si ya está en sharedDeps
                if (sharedDeps[propertyName]) {
                    // Ya está inyectado como dependencia compartida
                    if (!serviceInstance.hasOwnProperty(propertyName)) {
                        serviceInstance[propertyName] = sharedDeps[propertyName];
                    }
                } else {
                    // Obtenerlo normalmente
                    // NOTA: Si este servicio tiene dependencias de servicios del cluster,
                    // esas dependencias se resolverán a través del cluster cuando se accedan
                    const appService = registryRef.getService(appServiceKey, 'application', context, new Set());
                    serviceInstance[propertyName] = appService;
                }
            });
        }

        // Servicios de infraestructura particulares
        if (serviceDependencies.infrastructureServices) {
            const particularInfraServices = serviceDependencies.infrastructureServices.filter(
                infraServiceKey => !(sharedDepsConfig.infrastructureServices || []).includes(infraServiceKey)
            );
            particularInfraServices.forEach(infraServiceKey => {
                const infraService = registryRef.getService(infraServiceKey, 'infrastructure', context, new Set());
                const propertyName = registryRef.toCamelCase(infraServiceKey);
                serviceInstance[propertyName] = infraService;
            });
        }

        return serviceInstance;
    }

    /**
     * Genera una clave de cache para un cluster
     */
    getClusterCacheKey(clusterName, context) {
        const userId = context.user && context.user.user_id ? context.user.user_id : 'anonymous';
        return `cluster:${clusterName}:${userId}`;
    }

    /**
     * Limpia el cache de un cluster (útil para testing o reinicio)
     */
    clearClusterCache(clusterName = null, context = null) {
        if (clusterName && context) {
            const cacheKey = this.getClusterCacheKey(clusterName, context);
            this.clusterInstances.delete(cacheKey);
        } else if (clusterName) {
            // Limpiar todos los caches de un cluster específico
            const keysToDelete = [];
            this.clusterInstances.forEach((value, key) => {
                if (key.startsWith(`cluster:${clusterName}:`)) {
                    keysToDelete.push(key);
                }
            });
            keysToDelete.forEach(key => this.clusterInstances.delete(key));
        } else {
            // Limpiar todo
            this.clusterInstances.clear();
        }
    }
}

module.exports = ServiceClusterManager;

