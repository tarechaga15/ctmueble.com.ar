import api from "./axios";
import { createBusinessDTO } from "../api/dtos";

export const bussinessService = {
  /**
   * GET: datos de empresa por CUIT (normalizado con BusinessDTO).
   * @param {string} cuit
   * @returns {Promise<import("../api/dtos").BusinessDTO>}
   */
  get: async (cuit) => {
    const response = await api.get(`/bussiness/get?cuit=${cuit}`);
    return createBusinessDTO(response.data);
  },

  /**
   * GET: datos del padrón por CUIT (respuesta cruda).
   * @param {string} cuit
   * @returns {Promise<Object>}
   */
  getPadron: async (cuit) => {
    const response = await api.get(`/bussiness/padron?cuit=${cuit}`);
    return response.data;
  },

  /**
   * PUT: actualizar dirección de empresa.
   * @param {string} id - ID de la dirección
   * @param {{ address: string, location: string, district: string }} payload
   * @returns {Promise<Object>}
   */
  updateAddress: async (id, payload) => {
    const response = await api.put(
      `/bussiness/addresses/?id=${encodeURIComponent(id)}`,
      payload
    );
    return response.data;
  },
};
