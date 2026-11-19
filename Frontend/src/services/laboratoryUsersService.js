import api from "./axios";

export const laboratoryUsersService = {
  /**
   * Obtiene la lista de usuarios del laboratorio.
   */
  async getUsers() {
    const response = await api.get("/laboratory/users");
    return response.data;
  },

  /**
   * Crea un nuevo usuario interno de laboratorio y envía el correo de activación.
   */
  async createUser(payload) {
    const response = await api.post("/laboratory/users", payload);
    return response.data;
  },

  /**
   * Modifica los datos, rol y estado activo de un usuario.
   */
  async updateUser(id, payload) {
    const response = await api.put(`/laboratory/users/${id}`, payload);
    return response.data;
  },

  /**
   * Resetea la contraseña de un usuario interno.
   */
  async resetPassword(id, password) {
    const response = await api.post(`/laboratory/users/${id}/resetear-password`, { password });
    return response.data;
  },

  /**
   * Reenvía el correo con enlace y código de activación.
   */
  async resendActivation(id) {
    const response = await api.post(`/laboratory/users/${id}/reenviar-activacion`);
    return response.data;
  },

  /**
   * Obtiene el catálogo y matriz de permisos por rol.
   */
  async getPermissions() {
    const response = await api.get("/laboratory/users/permissions");
    return response.data;
  },

  /**
   * Guarda las modificaciones a la matriz de permisos.
   */
  async updatePermissions(items) {
    const response = await api.put("/laboratory/users/permissions", { items });
    return response.data;
  }
};
