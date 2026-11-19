/**
 * Contenedor de inyección de dependencias.
 * Centraliza la creación e inyección de todas las dependencias del sistema.
 * Implementa el patrón Singleton para garantizar una única instancia.
 */
const EssayRepository = require('../repositories/essays/EssayRepository');
const SampleRepository = require('../repositories/essays/SampleRepository');
const ClientRepository = require('../repositories/clients/ClientRepository');
const PersonRepository = require('../repositories/persons/PersonRepository');
const BusinessRepository = require('../repositories/business/BusinessRepository');
const UserRepository = require('../repositories/users/UserRepository');
const DocumentService = require('../documents/services/DocumentService');
const PadronService = require('../arca/services/PadronService');

const EssayApplicationService = require('../../application/essays/services/EssayApplicationService');
const ClientApplicationService = require('../../application/clients/services/ClientApplicationService');
const PersonApplicationService = require('../../application/persons/services/PersonApplicationService');
const BusinessApplicationService = require('../../application/business/services/BusinessApplicationService');
const UserApplicationService = require('../../application/users/services/UserApplicationService');

class Container {
  /**
   * Constructor del contenedor.
   * Inicializa las estructuras para almacenar dependencias.
   */
  constructor() {
    this.repositories = {};
    this._services = {};
    this.applicationServices = {};
    this.init();
  }

  /**
   * Inicializa todas las dependencias del sistema.
   * Crea instancias de repositorios, servicios y servicios de aplicación,
   * configurando las dependencias entre ellos.
   */
  init() {
    this.repositories.essay = new EssayRepository();
    this.repositories.sample = new SampleRepository();
    this.repositories.client = new ClientRepository();
    this.repositories.person = new PersonRepository();
    this.repositories.business = new BusinessRepository();
    this.repositories.user = new UserRepository();

    const EnvApplicationService = require('../../application/env/services/EnvApplicationService');
    this._services.document = new DocumentService(EnvApplicationService);
    this._services.padron = new PadronService();

    this.applicationServices.essay = new EssayApplicationService(
      this.repositories.essay,
      this.repositories.client,
      this.repositories.person,
      this._services.document,
      require('../../application/env/services/EnvApplicationService')
    );

    this.applicationServices.client = new ClientApplicationService(
      this.repositories.client,
      this.repositories.business
    );

    this.applicationServices.person = new PersonApplicationService(
      this.repositories.person
    );

    this.applicationServices.business = new BusinessApplicationService(
      this.repositories.business,
      this._services.padron
    );

    this.applicationServices.user = new UserApplicationService(
      this.repositories.user
    );
  }

  /**
   * Obtiene el servicio de aplicación de ensayos.
   * @returns {EssayApplicationService} Servicio de ensayos
   */
  getEssayService() {
    return this.applicationServices.essay;
  }

  /**
   * Obtiene el servicio de aplicación de muestras y órdenes de trabajo (alias del servicio de ensayos).
   * @returns {EssayApplicationService}
   */
  getSampleService() {
    return this.applicationServices.essay;
  }

  /**
   * Obtiene el servicio de aplicación de clientes.
   * @returns {ClientApplicationService} Servicio de clientes
   */
  getClientService() {
    return this.applicationServices.client;
  }

  /**
   * Obtiene el servicio de aplicación de personas.
   * @returns {PersonApplicationService} Servicio de personas
   */
  getPersonService() {
    return this.applicationServices.person;
  }

  /**
   * Obtiene el servicio de aplicación de empresas.
   * @returns {BusinessApplicationService} Servicio de empresas
   */
  getBusinessService() {
    return this.applicationServices.business;
  }

  /**
   * Obtiene el servicio de aplicación de usuarios.
   * @returns {UserApplicationService} Servicio de usuarios
   */
  getUserService() {
    return this.applicationServices.user;
  }

  /**
   * Getter para acceder a los servicios de infraestructura.
   * @returns {Object} Objeto con los servicios de infraestructura
   */
  get services() {
    return this._services;
  }
}

module.exports = new Container();

