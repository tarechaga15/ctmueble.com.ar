/**
 * DTOs de auth. Alineados con gestion.ctmueble.com.ar/src/application/auth/dto.
 *
 * GET (respuesta login): AuthTokensDTO — forma de la respuesta con access_token, refresh_token, user.
 * POST (request): el body de login es { mail, password }; la respuesta se modela con AuthTokensDTO.
 */

/**
 * DTO con los tokens de autenticación (GET – respuesta del login).
 * @typedef {Object} AuthTokensDTO
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {string} [user]
 */

/**
 * Normaliza datos de tokens (respuesta GET o para guardar en storage).
 * Acepta camelCase o snake_case.
 * @param {{ access_token?: string, refreshToken?: string, accessToken?: string, refresh_token?: string, user?: string }} data
 * @returns {{ access_token: string, refresh_token: string, user?: string }}
 */
export function toAuthTokensPayload(data) {
  const access = data.access_token ?? data.accessToken ?? "";
  const refresh = data.refresh_token ?? data.refreshToken ?? "";
  return {
    access_token: access,
    refresh_token: refresh,
    ...(data.user != null && { user: data.user }),
  };
}
