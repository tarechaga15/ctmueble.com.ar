/**
 * Servicio de dominio para validar permisos relacionados con usuarios.
 */
class UserPermissionService {
  async validateLaboratoryMembership(userId, laboratoryId, findUserLaboratories) {
    const memberships = await findUserLaboratories(userId);
    const hasMembership = Array.isArray(memberships) && memberships.some((m) => String(m.laboratory) === String(laboratoryId));

    if (!hasMembership) {
      const err = new Error('El usuario no es miembro de este laboratorio');
      err.status = 403;
      err.code = 'LABORATORY_MEMBERSHIP_REQUIRED';
      throw err;
    }

    return true;
  }
}

module.exports = UserPermissionService;
