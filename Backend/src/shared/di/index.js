/**
 * Dependency Injection Module
 * 
 * Exporta el contenedor DI y el registry de servicios
 */

const { container, serviceRegistry } = require('./serviceRegistry');

/**
 * Función única para crear servicios de aplicación
 * Esta función será llamada desde los controladores
 * 
 * @param {string} serviceKey - Clave del servicio (ej: 'PropertyService')
 * @param {Object} context - Contexto con sql.query, user, logger, execute, etc.
 * @returns {*} Instancia del servicio configurada con dependencias inyectadas
 */
function createService(serviceKey, context) {
    return serviceRegistry.createApplicationService(serviceKey, context);
}

/**
 * Función para obtener un cluster de servicios
 * 
 * @param {string} clusterName - Nombre del cluster (ej: 'AccountingCluster')
 * @param {Object} context - Contexto con sql.query, user, logger, execute, etc.
 * @returns {Object} Instancia del cluster con acceso lazy a servicios
 */
function getCluster(clusterName, context) {
    return serviceRegistry.getCluster(clusterName, context);
}

module.exports = {
    container,
    serviceRegistry,
    createService,
    getCluster
};
