# Uso de Clusters de Servicios

## Introducción

El sistema de clusters permite agrupar servicios de aplicación relacionados que comparten dependencias comunes, permitiendo que interactúen entre sí de forma lazy y evitando problemas de rendimiento y dependencias circulares.

## Características

- ✅ **Lazy Loading**: Los servicios se cargan solo cuando se acceden
- ✅ **Dependencias Compartidas**: Dependencias comunes se inyectan una vez y se comparten
- ✅ **Dependencias Particulares**: Cada servicio puede tener dependencias adicionales
- ✅ **Sin Dependencias Circulares**: Detección y resolución automática
- ✅ **Interacción entre Servicios**: Los servicios del cluster pueden acceder entre sí directamente
- ✅ **Sin Managers ni ParentService**: Los servicios acceden directamente a otros servicios del cluster por nombre

## Configuración

Los clusters se definen en `services.config.json` en la sección `clusters`:

```json
{
  "clusters": {
    "AccountingCluster": {
      "description": "Cluster de servicios de contabilidad",
      "services": [
        "AccountsService",
        "AgentService",
        "ConceptService",
        "DebtsService",
        "TransactionService",
        "VoucherService",
        "AgentsBalanceService"
      ],
      "sharedDependencies": {
        "repositories": [
          "AccountingAccountRepository",
          "AccountingAgentRepository"
        ],
        "applicationServices": [
          "ProfileService"
        ]
      }
    }
  }
}
```

### Estructura de un Cluster

- **services**: Array de nombres de servicios que pertenecen al cluster
- **sharedDependencies**: Dependencias que se comparten entre todos los servicios del cluster:
  - `repositories`: Repositorios compartidos
  - `domainServices`: Servicios de dominio compartidos
  - `applicationServices`: Servicios de aplicación compartidos (fuera del cluster)
  - `infrastructureServices`: Servicios de infraestructura compartidos

## Uso Básico

### Obtener un Cluster

```javascript
const { getCluster } = require('../../shared/di');
const SQLMiddleware = require('../middlewares/sql');

async function createAccountingCluster(req) {
    const context = {
        user: req.user,
        sql: await SQLMiddleware(req.transaction),
        req,
        logger: req.logger,
        execute: req.execute
    };

    // Obtener el cluster (lazy loading)
    const accountingCluster = getCluster('AccountingCluster', context);
    return accountingCluster;
}
```

### Acceder a Servicios del Cluster

Los servicios se acceden como propiedades del cluster (lazy loading):

```javascript
// El servicio se carga solo cuando se accede
const accountsService = accountingCluster.accountsService;
const agentService = accountingCluster.agentService;
const conceptService = accountingCluster.conceptService;

// Usar los servicios
const accounts = await accountsService.fetch();
const agents = await agentService.fetch();
```

### Interacción entre Servicios del Cluster

Los servicios del cluster pueden acceder entre sí directamente si están configurados como dependencias. **No existe el concepto de managers ni parentService**. Cada servicio accede directamente a otros servicios del cluster por nombre:

```javascript
// En ConceptService, si necesita AccountsService:
// En services.config.json, ConceptService tiene:
// "applicationServices": ["AccountsService"]
// 
// Si AccountsService está en el cluster, se inyecta automáticamente
// como dependencia lazy, permitiendo acceso circular seguro

class ConceptService {
    async addConcept(data) {
        // AccountsService está disponible como dependencia inyectada
        // Acceso directo al servicio, no a través de managers
        const account = await this.accountsService.get(data.account);
        // ...
    }
}

// Ejemplo en PropertyService:
class PropertyService {
    async create(data) {
        // Acceso directo a servicios del cluster
        const typeData = await this.propertyTypesService.get_type_data(data.type);
        await this.propertyRelatedPeopleService.set({...});
        await this.propertyBillsService.set({...});
    }
}
```

### Acceso Dinámico

```javascript
// Obtener un servicio por nombre
const serviceName = 'AccountsService';
const service = accountingCluster.getService(serviceName);

// Listar servicios disponibles
const availableServices = accountingCluster.getAvailableServices();
// ['AccountsService', 'AgentService', 'ConceptService', ...]
```

## Ejemplo Completo: Controlador con Cluster

```javascript
const { getCluster } = require('../../shared/di');
const SQLMiddleware = require('../middlewares/sql');

async function createAccountingCluster(req) {
    const context = {
        user: req.user,
        sql: await SQLMiddleware(req.transaction),
        req,
        logger: req.logger,
        execute: req.execute
    };

    return getCluster('AccountingCluster', context);
}

// En una ruta
async function createAccount(req, res) {
    try {
        const cluster = await createAccountingCluster(req);
        
        // Acceder a servicios del cluster (lazy loading)
        const accountsService = cluster.accountsService;
        const agentService = cluster.agentService;
        
        // Usar los servicios
        const account = await accountsService.create({ /* ... */ });
        const agent = await agentService.get({ /* ... */ });
        
        res.json({ account, agent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

## Ventajas sobre Servicios Individuales y Managers

### Antes (Sin Clusters, con Managers)

```javascript
// Cada servicio se crea independientemente
const propertyService = createService('PropertyService', context);

// Acceso a través de managers (patrón antiguo)
await propertyService.managers.types.get_type_data(type);
await propertyService.managers.related_people.set({...});
await propertyService.managers.bills.set({...});

// Problemas:
// - Cada servicio carga todas sus dependencias
// - Dependencias duplicadas (ProfileService se crea múltiples veces)
// - Posibles dependencias circulares
// - Mayor tiempo de inicialización
// - Managers requieren parentService
// - Acceso indirecto a través de managers
```

### Después (Con Clusters, sin Managers)

```javascript
// Un solo cluster con lazy loading
const cluster = getCluster('PropertyCluster', context);

// Acceso directo a servicios del cluster
const typeData = await cluster.propertyTypesService.get_type_data(type);
await cluster.propertyRelatedPeopleService.set({...});
await cluster.propertyBillsService.set({...});

// O dentro de un servicio del cluster:
class PropertyService {
    async create(data) {
        // Acceso directo a otros servicios del cluster
        const typeData = await this.propertyTypesService.get_type_data(data.type);
        await this.propertyRelatedPeopleService.set({...});
    }
}

// Ventajas:
// - Dependencias compartidas se crean una vez
// - Servicios se cargan solo cuando se necesitan
// - Sin dependencias circulares
// - Mejor rendimiento
// - Acceso directo a servicios (sin managers ni parentService)
// - Código más limpio y mantenible
```

## Dependencias Compartidas vs Particulares

### Dependencias Compartidas

Se definen en `sharedDependencies` del cluster y se inyectan en todos los servicios:

```json
{
  "sharedDependencies": {
    "repositories": ["AccountingAccountRepository"],
    "applicationServices": ["ProfileService"]
  }
}
```

### Dependencias Particulares

Se definen en la configuración individual de cada servicio y se inyectan además de las compartidas:

```json
{
  "ConceptService": {
    "dependencies": {
      "repositories": ["AccountingConceptRepository"], // Particular
      "applicationServices": ["AccountsService"] // Puede ser del cluster
    }
  }
}
```

## Mejores Prácticas

1. **Agrupar servicios relacionados**: Los servicios que trabajan juntos deben estar en el mismo cluster
2. **Compartir dependencias comunes**: Mover dependencias repetidas a `sharedDependencies`
3. **Usar lazy loading**: No acceder a servicios hasta que realmente se necesiten
4. **Evitar clusters muy grandes**: Mantener clusters enfocados en un dominio específico

## Resolución de Dependencias Circulares

El sistema maneja automáticamente las dependencias circulares entre servicios del cluster usando lazy loading:

```javascript
// AccountsService depende de ConceptService
// ConceptService depende de AccountsService
// ✅ Funciona porque se usan getters lazy

class AccountsService {
    async getBalance() {
        // ConceptService se carga solo cuando se accede
        const concepts = await this.conceptService.fetch();
        // ...
    }
}

class ConceptService {
    async addConcept() {
        // AccountsService se carga solo cuando se accede
        const account = await this.accountsService.get();
        // ...
    }
}
```

## Cache

Los clusters se cachean por usuario y contexto. Si necesitas limpiar el cache:

```javascript
const { serviceRegistry } = require('../../shared/di');

// Limpiar cache de un cluster específico
serviceRegistry.clusterManager.clearClusterCache('AccountingCluster', context);

// Limpiar todo el cache
serviceRegistry.clusterManager.clearClusterCache();
```

