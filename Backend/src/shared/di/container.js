/**
 * Dependency Injection Container
 * 
 * Gestiona la inyección de dependencias para servicios de aplicación,
 * repositorios y servicios de dominio como singletons.
 */
class DIContainer {
    constructor() {
        this.instances = new Map(); // Cache de instancias singleton
        this.factories = new Map(); // Factory functions para crear instancias
        this.dependencies = new Map(); // Mapeo de dependencias
    }

    /**
     * Registra una clase o factory con sus dependencias
     * @param {string} key - Clave única para el servicio
     * @param {Function|Object} factory - Clase o factory function
     * @param {Array<string>} dependencies - Lista de claves de dependencias
     * @param {boolean} singleton - Si es true, se crea una sola instancia
     */
    register(key, factory, dependencies = [], singleton = true) {
        this.factories.set(key, factory);
        this.dependencies.set(key, dependencies);
        
        if (!singleton) {
            // Para no-singletons, almacenamos la factory pero no la instancia
            this.instances.set(key, null);
        }
    }

    /**
     * Obtiene una instancia del servicio
     * @param {string} key - Clave del servicio
     * @param {Object} context - Contexto de la petición (para servicios que lo necesitan)
     * @returns {*} Instancia del servicio
     */
    get(key, context = null) {
        // Verificar si es singleton y ya existe
        if (this.instances.has(key) && this.instances.get(key) !== null) {
            return this.instances.get(key);
        }

        // Obtener factory
        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`Service ${key} not registered in container`);
        }

        // Resolver dependencias
        const depKeys = this.dependencies.get(key) || [];
        const resolvedDeps = depKeys.map(depKey => {
            if (depKey === 'context') {
                // Validar que context existe si se requiere
                if (context === undefined || context === null) {
                    throw new Error(
                        `Container: Service "${key}" requires context but received ${context === undefined ? 'undefined' : 'null'}. ` +
                        `Make sure you are passing a valid context object when requesting this service.`
                    );
                }
                return context;
            }
            // Recursivamente obtener dependencias
            return this.get(depKey, context);
        });
        // Crear instancia
        let instance;
        try {
            if (typeof factory === 'function') {
                // Si es una clase o función constructora
                if (/^\s*class\s+/.test(factory.toString())) {
                    // Es una clase
                    // Si no hay dependencias, crear sin parámetros
                    // Si hay dependencias, pasar los parámetros resueltos
                    if (resolvedDeps.length === 0) {
                        instance = new factory();
                    } else {
                        instance = new factory(...resolvedDeps);
                    }
                } else {
                    // Es una función factory
                    if (resolvedDeps.length === 0) {
                        instance = factory();
                    } else {
                        instance = factory(...resolvedDeps);
                    }
                }
            } else {
                // Ya es una instancia
                instance = factory;
            }
        } catch (error) {
            // Mejorar el mensaje de error para incluir información sobre destructuring
            const errorDetails = error.message;
            let additionalInfo = '';
            
            if (error.message.includes('Cannot destructure')) {
                additionalInfo = ` This suggests the constructor is trying to destructure a parameter that is undefined. `;
                if (resolvedDeps.length === 0) {
                    additionalInfo += `The service was instantiated with no parameters, but the constructor might be expecting an object parameter.`;
                } else {
                    additionalInfo += `Parameters provided: ${resolvedDeps.map((d, i) => {
                        if (d === undefined) return `param${i}: undefined`;
                        if (d === null) return `param${i}: null`;
                        if (typeof d === 'object') return `param${i}: object${Object.keys(d).length === 0 ? ' (empty)' : ` with keys: ${Object.keys(d).join(', ')}`}`;
                        return `param${i}: ${typeof d}`;
                    }).join(', ')}`;
                }
            }
            
            throw new Error(
                `Container: Failed to create instance of "${key}": ${errorDetails}.${additionalInfo} ` +
                `Expected dependencies: ${depKeys.length > 0 ? depKeys.join(', ') : 'none'}`
            );
        }

        // Cachear si es singleton (verificar que no está marcado como no-singleton)
        const depConfig = this.dependencies.get(key);
        if (depConfig !== undefined || !this.instances.has(key) || this.instances.get(key) === undefined) {
            // Si no tiene dependencias configuradas o la instancia no existe, cachear
            this.instances.set(key, instance);
        }

        return instance;
    }

    /**
     * Verifica si un servicio está registrado
     */
    has(key) {
        return this.factories.has(key);
    }

    /**
     * Limpia todas las instancias (útil para tests)
     */
    clear() {
        this.instances.clear();
    }

    /**
     * Limpia una instancia específica
     */
    clearInstance(key) {
        this.instances.delete(key);
    }
}

module.exports = DIContainer;

