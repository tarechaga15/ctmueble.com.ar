/**
 * DTOs alineados con el backend (gestion.ctmueble.com.ar, carpeta application, DTOs por caso).
 *
 * GET: usar create*DTO(respuesta) para normalizar respuestas de la API.
 * POST/PUT: usar create*DTO + validate*DTO + toPlain*DTO para armar y validar el body antes de enviar.
 *
 * Importar desde aquí o desde el archivo concreto (ej. dtos/essays).
 */

// Auth (GET: respuesta login)
export { toAuthTokensPayload } from "./auth.js";

// Business (GET)
export { createBusinessDTO } from "./business.js";

// Clients (GET, POST, PUT)
export {
  createClientDTO,
  createCreateClientDTO,
  validateCreateClientDTO,
  toPlainCreateClientDTO,
  createUpdateClientDTO,
  validateUpdateClientDTO,
  toPlainUpdateClientDTO,
} from "./clients.js";

// Persons (GET, POST, PUT)
export {
  createPersonDTO,
  createCreatePersonDTO,
  validateCreatePersonDTO,
  toPlainCreatePersonDTO,
  createUpdatePersonDTO,
  validateUpdatePersonDTO,
  toPlainUpdatePersonDTO,
} from "./persons.js";

// Users (GET)
export { createUserDTO } from "./users.js";

// Essays (GET, POST, PUT)
export {
  createEssayDTO,
  createCreateEssayDTO,
  validateCreateEssayDTO,
  toPlainCreateEssayDTO,
  createUpdateEssayDTO,
  toPlainUpdateEssayDTO,
} from "./essays.js";

// Samples y términos (GET, POST, PUT)
export {
  createSampleDTO,
  createLoadSampleDTO,
  validateLoadSampleDTO,
  toPlainLoadSampleDTO,
  normalizeLoadSampleResultsDTO,
  validateLoadSampleResultsDTO,
  createLoadSamplesDTO,
  validateLoadSamplesDTO,
  createSetTermsDTO,
  validateSetTermsDTO,
  toPlainSetTermsDTO,
  createUpdateSampleDTO,
  validateUpdateSampleDTO,
  toPlainUpdateSampleDTO,
} from "./samples.js";
