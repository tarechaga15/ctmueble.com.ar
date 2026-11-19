const sequelize = require('../config/db');

const Laboratory = require('./laboratories/laboratory');
const LabMembers = require('./laboratories/members');
const LaboratoryPermission = require('./laboratories/laboratory_permission');
const User = require('./users/user');
const Essay = require('./essays/essay');
const Persons = require('./clients/persons');
const Client = require('./clients/client');
const ClientsContacts = require('./clients/client_contacts');
const Bussiness = require('./clients/bussiness');
const BussinessAddress = require('./clients/address');
const EssayType = require('./essays/type');
const Elements = require('./essays/elements');
const EssayElementTemplate = require('./essays/essay_element_template');
const Terms = require('./essays/terms');
const Sample = require('./essays/samples');
const WorkOrder = require('./essays/work_order');
const WorkOrderAuditLog = require('./essays/work_order_audit_log');
const EssayAuditLog = require('./essays/essay_audit_log');
const EssayClient = require('./essays/essay_client');
const Document = require('./documents/document');
const Types = require('./documents/types');
const Country = require('./types/geo/countries');
const District = require('./types/geo/districts');
const Env = require('./env');
const SecurityAuditLog = require('./security/security_audit_log');
const SystemApiKey = require('./security/system_api_key');
const EmailVerification = require('./security/email_verification');
const UserSession = require('./users/user_session');
const UserRecoveryCode = require('./users/user_recovery_code');
const UserTrustedDevice = require('./users/user_trusted_device');
const EssayDocumentSnapshot = require('./essays/essay_document_snapshot');

const models = {
  Laboratory,
  LabMembers,
  User,
  UserSession,
  UserRecoveryCode,
  UserTrustedDevice,
  Essay,
  Persons,
  Client,
  ClientsContacts,
  Bussiness,
  BussinessAddress,
  EssayType,
  Elements,
  EssayElementTemplate,
  Terms,
  Sample,
  WorkOrder,
  WorkOrderAuditLog,
  EssayAuditLog,
  EssayClient,
  Document,
  Types,
  Country,
  District,
  Env,
  SecurityAuditLog,
  SystemApiKey,
  EmailVerification,
  LaboratoryPermission,
  EssayDocumentSnapshot
};

// Relaciones de Laboratorios y Usuarios
LabMembers.belongsTo(User, { foreignKey: 'user', as: 'memberUser' });
User.hasOne(LabMembers, { foreignKey: 'user', as: 'labMembership' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserRecoveryCode, { foreignKey: 'user_id', as: 'recoveryCodes' });
UserRecoveryCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserTrustedDevice, { foreignKey: 'user_id', as: 'trustedDevices' });
UserTrustedDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relaciones de Essays con otros modelos
Essay.belongsTo(EssayType, { foreignKey: 'essay', as: 'type' });
Essay.hasOne(Elements, { foreignKey: 'essay', as: 'elements' });
Essay.hasMany(Document, { foreignKey: 'essay', as: 'essayDocuments' });
Elements.belongsTo(Essay, { foreignKey: 'essay', as: 'essayRef' });
Elements.belongsTo(Country, { foreignKey: 'country', as: 'countryData' });
Essay.hasOne(Terms, { foreignKey: 'essay', as: 'terms' });
Terms.belongsTo(Essay, { foreignKey: 'essay', as: 'essayTerms' });
Essay.hasMany(WorkOrder, { foreignKey: 'essay_id', as: 'workOrders' });
WorkOrder.belongsTo(Essay, { foreignKey: 'essay_id', as: 'essay' });
Essay.hasMany(Sample, { foreignKey: 'essay', as: 'samples' });
Sample.belongsTo(Essay, { foreignKey: 'essay', as: 'essaySample' });
WorkOrder.hasMany(Sample, { foreignKey: 'work_order', as: 'samples' });
Sample.belongsTo(WorkOrder, { foreignKey: 'work_order', as: 'workOrder' });
WorkOrder.hasMany(WorkOrderAuditLog, { foreignKey: 'work_order_id', as: 'workOrderAuditLogs' });
WorkOrderAuditLog.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });
WorkOrderAuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'userAudit' });
User.hasMany(EssayElementTemplate, { foreignKey: 'user_id', as: 'essayElementTemplates' });
EssayElementTemplate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
EssayElementTemplate.belongsTo(Country, { foreignKey: 'country', as: 'countryData' });
Essay.hasMany(EssayAuditLog, { foreignKey: 'essay', as: 'auditLogs' });
EssayAuditLog.belongsTo(Essay, { foreignKey: 'essay', as: 'essayAudit' });
EssayAuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'userAudit' });

// Relaciones de EssayDocumentSnapshot
Essay.hasMany(EssayDocumentSnapshot, { foreignKey: 'essay_id', as: 'snapshots' });
EssayDocumentSnapshot.belongsTo(Essay, { foreignKey: 'essay_id', as: 'essay' });
EssayDocumentSnapshot.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Relaciones de EssayClient
Essay.hasOne(EssayClient, { foreignKey: 'essay', as: 'essayClient' });
EssayClient.belongsTo(Essay, { foreignKey: 'essay', as: 'essayRef' });
EssayClient.belongsTo(Bussiness, { foreignKey: 'cuit', targetKey: 'cuit', as: 'business', constraints: false });
EssayClient.belongsTo(BussinessAddress, { foreignKey: 'address', targetKey: 'id', as: 'addressRef', constraints: false });
EssayClient.belongsTo(Persons, { foreignKey: 'representative', as: 'representativeRef' });
EssayClient.belongsTo(Persons, { foreignKey: 'contact', as: 'contactRef' });

// Relaciones de Bussiness con otros modelos
Bussiness.hasMany(Client, { foreignKey: 'cuit', as: 'clients' });
Bussiness.hasMany(BussinessAddress, { foreignKey: 'cuit', as: 'addresses' });
BussinessAddress.belongsTo(Bussiness, { foreignKey: 'cuit', as: 'bussiness' });
BussinessAddress.belongsTo(District, { foreignKey: 'district', as: 'districtData' });

// Relaciones de Clients con otros modelos
Client.belongsTo(Bussiness, { foreignKey: 'cuit', targetKey: 'cuit', as: 'bussiness', constraints: false });
Client.belongsTo(BussinessAddress, { foreignKey: 'address', targetKey: 'id', as: 'clientAddress', constraints: false });
Client.belongsTo(District, { foreignKey: 'address_district', targetKey: 'id', as: 'clientDistrictData', constraints: false });
Client.belongsTo(User, { foreignKey: 'user', as: 'loadedBy' });
Client.belongsTo(Persons, { foreignKey: 'representative', as: 'representativeRef' });
Client.belongsTo(Persons, { foreignKey: 'contact', as: 'contactRef' });
Client.hasMany(ClientsContacts, { foreignKey: 'client', as: 'contacts' });
ClientsContacts.belongsTo(Client, { foreignKey: 'client', as: 'clientContact' });
ClientsContacts.belongsTo(Persons, { foreignKey: 'contact', as: 'contactContact' });

// Relaciones de Persons con otros modelos
Persons.belongsTo(District, { foreignKey: 'district', as: 'districtData' });
Persons.belongsTo(Country, { foreignKey: 'country', as: 'countryData' });
Persons.hasMany(Client, { foreignKey: 'representative', as: 'clientsRef' });
Persons.hasMany(Client, { foreignKey: 'contact', as: 'clientsAsContact' });
Persons.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relaciones de Documents con otros modelos
Document.belongsTo(Essay, { foreignKey: 'essay', as: 'essayDocument' });
Document.belongsTo(Types, { foreignKey: 'type', as: 'typeDocument' });

module.exports = { sequelize, ...models };
