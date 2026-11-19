import api from "./axios";

export const typesService = {
  getTypes: async ({type}) => {
    if (!type) {
      throw new Error("Type is required");
    }
    const response = await api.get(`/types/${type}`);
    return response.data;
  },

  /** POST: alta de tipo de ensayo. Devuelve { id, name }. */
  createEssay: async (name) => {
    const response = await api.post("/types/essays", { name });
    return response.data;
  },
};