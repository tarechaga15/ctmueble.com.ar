/**
 * Servicio de aplicación para gestionar usuarios y cambios de perfil/laboratorio.
 * - Bloquea la escalada de privilegios `CLIENT -> LABORATORY` verificando membresía real en `laboratories_members`.
 */
const UserDTO = require('../dto/UserDTO');
const UserPermissionService = require('../../../domain/users/services/UserPermissionService');

function httpError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

class UserApplicationService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.permissionService = new UserPermissionService();
    this.context = {};
  }

  async getUser(id) {
    if (!id) throw httpError('ID de usuario requerido', 400, 'USER_ID_REQUIRED');
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    let isSuperAdmin = user.mail === 'tarechaga15@gmail.com' || user.mail === 'dev@ctmueble.com.ar';
    let labRole = isSuperAdmin ? 'ADMIN' : null;

    try {
      const memberships = await this.userRepository.findUserLaboratories(id);
      if (Array.isArray(memberships) && memberships.length > 0) {
        labRole = memberships[0].role || 'USER';
        if (labRole === 'ADMIN') {
          isSuperAdmin = true;
        }
      }
    } catch (_) {}

    return this.mapToDTO(user, { isSuperAdmin, labRole });
  }

  /**
   * Cambia el perfil activo del usuario validando membresía efectiva cuando solicita `LABORATORY`.
   */
  async switchProfile(userId, profile) {
    if (!userId) throw httpError('ID de usuario requerido', 400, 'USER_ID_REQUIRED');
    const targetProfile = String(profile || '').trim().toUpperCase();
    if (!['CLIENT', 'LABORATORY'].includes(targetProfile)) {
      throw httpError('Perfil inválido', 400, 'INVALID_PROFILE');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    if (targetProfile === 'LABORATORY') {
      const memberships = await this.userRepository.findUserLaboratories(userId);
      if (!Array.isArray(memberships) || memberships.length === 0) {
        throw httpError(
          'No perteneces a ningún laboratorio registrado para activar el perfil LABORATORY',
          403,
          'LABORATORY_MEMBERSHIP_REQUIRED'
        );
      }
      if (!user.laboratory || !memberships.some((m) => String(m.laboratory) === String(user.laboratory))) {
        user.switchLaboratory(memberships[0].laboratory);
      }
    }

    user.switchProfile(targetProfile);
    await this.userRepository.update(user);
    return this.mapToDTO(user);
  }

  async switchLaboratory(userId, laboratory) {
    if (!userId) throw httpError('ID de usuario requerido', 400, 'USER_ID_REQUIRED');
    if (!laboratory) throw httpError('ID de laboratorio requerido', 400, 'LABORATORY_ID_REQUIRED');

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw httpError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    await this.permissionService.validateLaboratoryMembership(
      userId,
      laboratory,
      async () => this.userRepository.findUserLaboratories(userId)
    );

    user.switchLaboratory(laboratory);
    await this.userRepository.update(user);
    return true;
  }

  async getUserLaboratories(userId) {
    if (!userId) throw httpError('ID de usuario requerido', 400, 'USER_ID_REQUIRED');
    return this.userRepository.findUserLaboratories(userId);
  }

  async getClientData({ user: userId }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    const person = this.personService ? await this.personService.getMyPersonProfile() : null;
    const clients = this.clientService ? await this.clientService.getAllClients() : [];
    return { person, clients };
  }

  async updateClientData({ user: userId, data }) {
    if (!userId) throw httpError('Usuario no autenticado', 401, 'AUTH_REQUIRED');
    if (!this.personService) {
      throw httpError('Servicio de personas no disponible', 500, 'SERVICE_UNAVAILABLE');
    }
    const currentPerson = await this.personService.getMyPersonProfile();
    if (!currentPerson || !currentPerson.id) {
      throw httpError('Perfil de persona no encontrado', 404, 'PERSON_NOT_FOUND');
    }
    const updated = await this.personService.updatePerson(currentPerson.id, data || {});

    if (this.userRepository && (data?.name || data?.dni)) {
      try {
        const user = await this.userRepository.findById(userId);
        if (user) {
          if (data.name) user.name = String(data.name).trim();
          if (data.dni) user.dni = String(data.dni).trim();
          await this.userRepository.update(user);
        }
      } catch (_) {}
    }

    return updated;
  }

  mapToDTO(user, { isSuperAdmin = false, labRole = null } = {}) {
    return new UserDTO({
      id: user.id,
      mail: user.mail,
      name: user.name,
      dni: user.dni,
      profile: user.profile,
      laboratory: user.laboratory,
      createdAt: user.createdAt,
      isSuperAdmin,
      labRole,
      isActive: user.isActive !== false
    });
  }
}

module.exports = UserApplicationService;
