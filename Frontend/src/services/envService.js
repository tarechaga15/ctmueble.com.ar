import api from "./axios";

export const envService = {
  /**
   * Devuelve la lista de variables de entorno con metadatos.
   * Cada item: { id, label, type, value, hardcoded }
   */
  async fetch(mode) {
    const response = await api.get("/env/fetch", {
      params: mode ? { mode } : undefined,
    });
    return response.data;
  },

  async update({ id, value }) {
    const response = await api.put(
      "/env/update",
      { value },
      { params: { id } }
    );
    return response.data;
  },

  async add({ id, label, type, value }) {
    const response = await api.post("/env/add", {
      id,
      label,
      type,
      value,
    });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete("/env/delete", {
      params: { id },
    });
    return response.data;
  },
};

