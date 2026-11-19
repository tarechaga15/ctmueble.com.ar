/**
 * Fábrica de servicios con importaciones directas e inicialización manual.
 */
const SampleRepository = require('../infrastructure/repositories/essays/SampleRepository');
const WorkOrderRepository = require('../infrastructure/repositories/essays/WorkOrderRepository');
const EssayElementTemplateRepository = require('../infrastructure/repositories/essays/EssayElementTemplateRepository');
const ClientRepository = require('../infrastructure/repositories/clients/ClientRepository');
const PersonRepository = require('../infrastructure/repositories/persons/PersonRepository');
const BusinessRepository = require('../infrastructure/repositories/business/BusinessRepository');
const UserRepository = require('../infrastructure/repositories/users/UserRepository');
const DocumentRepository = require('../infrastructure/repositories/documents/DocumentRepository');
const EssayAuditLogRepository = require('../infrastructure/repositories/essays/EssayAuditLogRepository');
const WorkOrderAuditLogRepository = require('../infrastructure/repositories/essays/WorkOrderAuditLogRepository');
const EssayRepository = require('../infrastructure/repositories/essays/EssayRepository');

const Essay = require('../domain/essays/entities/Essay');
const Sample = require('../domain/essays/entities/Sample');
const Client = require('../domain/clients/entities/Client');
const Person = require('../domain/persons/entities/Person');
const Business = require('../domain/business/entities/Business');
const Document = require('../domain/documents/entities/Document');
const EssayAuditLog = require('../domain/essays/entities/EssayAuditLog');
const WorkOrderAuditLog = require('../domain/essays/entities/WorkOrderAuditLog');

const EssayService = require('../domain/essays/services/EssayService');
const SampleService = require('../domain/essays/services/SampleService');
const ClientOriginService = require('../domain/clients/services/ClientOriginService');
const PersonValidationService = require('../domain/persons/services/PersonValidationService');
const AddressOriginService = require('../domain/business/services/AddressOriginService');

const DocumentInfrastructureService = require('../infrastructure/documents/services/DocumentInfrastructureService');
const HandlebarsService = require('../infrastructure/templates/HandlebarsService');
const PasswordHasherService = require('../infrastructure/auth/services/PasswordHasherService');
const jwtService = require('../infrastructure/auth/services/JWTService');
const EssayTypeRepository = require('../infrastructure/repositories/types/EssayTypeRepository');
const CountryRepository = require('../infrastructure/repositories/types/CountryRepository');
const DistrictRepository = require('../infrastructure/repositories/types/DistrictRepository');

let PadronServiceInstance = null;
const sharedDocumentInfraService = new DocumentInfrastructureService();
const sharedHandlebarsService = new HandlebarsService();
const sharedEssayDomainService = new EssayService();
const sharedSampleDomainService = new SampleService();
const sharedClientOriginService = new ClientOriginService();
const sharedPersonValidationService = new PersonValidationService();
const sharedAddressOriginService = new AddressOriginService();

function getPadronService() {
  if (!PadronServiceInstance) {
    try {
      const PadronService = require('../infrastructure/arca/services/PadronService');
      PadronServiceInstance = new PadronService();
    } catch (e) {
      console.warn('[serviceFactory] PadronService no disponible:', e.message);
      return null;
    }
  }
  return PadronServiceInstance;
}

const essayElementTemplateRepository = new EssayElementTemplateRepository();
const clientRepository = new ClientRepository();
const personRepository = new PersonRepository();
const userRepository = new UserRepository();
const essayTypeRepository = new EssayTypeRepository();
const countryRepository = new CountryRepository();
const districtRepository = new DistrictRepository();

function getEnvService(context) {
  const EnvApplicationService = require('../application/env/services/EnvApplicationService');
  return new EnvApplicationService({ context: context || {} });
}

function getEssayAuditLogService(context) {
  const EssayAuditLogApplicationService = require('../application/essays/services/EssayAuditLogApplicationService');
  const ctx = context || {};
  const svc = new EssayAuditLogApplicationService({ context: ctx });
  svc.essayAuditLogRepository = new EssayAuditLogRepository({ transaction: ctx.transaction });
  svc.workOrderAuditLogRepository = new WorkOrderAuditLogRepository({ transaction: ctx.transaction });
  svc.essayRepository = new EssayRepository({ transaction: ctx.transaction });
  svc.workOrderRepository = new WorkOrderRepository({ transaction: ctx.transaction });
  svc.userRepository = userRepository;
  svc.essayAuditLog = EssayAuditLog;
  svc.workOrderAuditLog = WorkOrderAuditLog;
  return svc;
}

function getDocumentService(context) {
  const DocumentApplicationService = require('../application/documents/services/DocumentApplicationService');
  const ctx = context || {};
  const svc = new DocumentApplicationService({ context: ctx });
  svc.documentRepository = new DocumentRepository({ transaction: ctx.transaction });
  svc.essayRepository = new EssayRepository({ transaction: ctx.transaction });
  svc.workOrderRepository = new WorkOrderRepository({ transaction: ctx.transaction });
  svc.documentInfrastructureService = sharedDocumentInfraService;
  svc.handlebarsService = sharedHandlebarsService;
  svc.envService = getEnvService(ctx);
  svc.getEssayService = () => getEssayService(ctx);
  return svc;
}

function getEssayService(context) {
  const EssayApplicationService = require('../application/essays/services/EssayApplicationService');
  const ctx = context || {};
  const svc = new EssayApplicationService({ context: ctx });
  svc.essayRepository = new EssayRepository({ transaction: ctx.transaction });
  svc.workOrderRepository = new WorkOrderRepository({ transaction: ctx.transaction });
  svc.clientRepository = clientRepository;
  svc.personRepository = personRepository;
  svc.documentRepository = new DocumentRepository({ transaction: ctx.transaction });
  svc.sampleRepository = new SampleRepository({ transaction: ctx.transaction });
  svc.essayTypeRepository = essayTypeRepository;
  svc.essayDomainService = sharedEssayDomainService;
  svc.essayPermissionService = sharedEssayDomainService;
  svc.essay = Essay;
  svc.clientService = getClientService(ctx);
  svc.personService = getPersonService(ctx);
  svc.documentService = getDocumentService(ctx);
  svc.essayAuditLogService = getEssayAuditLogService(ctx);
  svc.elementTemplateService = getElementTemplateService(ctx);
  svc.snapshotService = getSnapshotService(ctx);
  svc.envService = getEnvService(ctx);
  svc.sampleDomainService = sharedSampleDomainService;
  svc.sample = Sample;
  return svc;
}

function getSampleService(context) {
  return getEssayService(context);
}

function getWorkOrderService(context) {
  return getSampleService(context);
}

function getPersonService(context) {
  const PersonApplicationService = require('../application/persons/services/PersonApplicationService');
  const svc = new PersonApplicationService({ context: context || {} });
  svc.personRepository = personRepository;
  svc.clientRepository = clientRepository;
  svc.userRepository = userRepository;
  svc.person = Person;
  svc.personValidationService = sharedPersonValidationService;
  return svc;
}

function getBusinessService(context) {
  const BusinessApplicationService = require('../application/business/services/BusinessApplicationService');
  const ctx = context || {};
  const svc = new BusinessApplicationService({ context: ctx });
  svc.businessRepository = new BusinessRepository({ transaction: ctx.transaction });
  svc.business = Business;
  svc.addressOriginService = sharedAddressOriginService;
  svc.padronService = getPadronService();
  svc.personService = getPersonService(ctx);
  svc.districtRepository = districtRepository;
  return svc;
}

function getClientService(context) {
  const ClientApplicationService = require('../application/clients/services/ClientApplicationService');
  const ctx = context || {};
  const svc = new ClientApplicationService({ context: ctx });
  svc.clientRepository = clientRepository;
  svc.businessRepository = new BusinessRepository({ transaction: ctx.transaction });
  svc.client = Client;
  svc.clientOriginService = sharedClientOriginService;
  svc.personService = getPersonService(ctx);
  svc.businessService = getBusinessService(ctx);
  return svc;
}

function getUserService(context) {
  const UserApplicationService = require('../application/users/services/UserApplicationService');
  const svc = new UserApplicationService(userRepository);
  svc.context = context || {};
  svc.clientService = getClientService(context || {});
  svc.personService = getPersonService(context || {});
  return svc;
}

function getUserAccountService(context) {
  const UserAccountApplicationService = require('../application/users/services/UserAccountApplicationService');
  return new UserAccountApplicationService({
    userRepository
  });
}

function getAuthService() {
  const AuthApplicationService = require('../application/auth/services/AuthApplicationService');
  return new AuthApplicationService({
    userRepository,
    personRepository,
    passwordHasher: PasswordHasherService,
    jwtService
  });
}

function getTypesService() {
  const TypesApplicationService = require('../application/types/services/TypesApplicationService');
  return new TypesApplicationService({
    essayTypeRepository,
    countryRepository,
    districtRepository
  });
}

function getElementTemplateService(context) {
  const EssayElementTemplateApplicationService = require('../application/essays/services/EssayElementTemplateApplicationService');
  const svc = new EssayElementTemplateApplicationService({ context: context || {} });
  svc.essayElementTemplateRepository = essayElementTemplateRepository;
  return svc;
}

function getSnapshotService(context) {
  const SnapshotApplicationService = require('../application/essays/services/SnapshotApplicationService');
  return new SnapshotApplicationService({ context: context || {} });
}

function buildContext(req) {
  return {
    user: req.user,
    auth: req.auth,
    transaction: req.transaction,
    request: req,
    req,
    response: req.res,
    sql: req.transaction ? { query: req.transaction } : undefined,
    logger: req.logger || console,
    execute: req.execute
  };
}

module.exports = {
  buildContext,
  getAuthService,
  getEnvService,
  getEssayAuditLogService,
  getDocumentService,
  getEssayService,
  getElementTemplateService,
  getWorkOrderService,
  getSampleService,
  getPersonService,
  getBusinessService,
  getClientService,
  getUserService,
  getUserAccountService,
  getPadronService,
  getTypesService,
  getSnapshotService
};
