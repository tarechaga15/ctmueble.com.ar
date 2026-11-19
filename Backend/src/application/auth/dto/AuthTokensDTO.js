/**
 * DTO con los tokens de autenticación y datos mínimos del usuario.
 * En producción omite los tokens crudos del JSON público (viajan únicamente en cookies HttpOnly).
 * En development/test conserva `access_token` y `refresh_token` en la respuesta JSON.
 */
class AuthTokensDTO {
  constructor({ accessToken, refreshToken, sessionId = null, userMail = null, user = null }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.sessionId = sessionId;
    this.userMail = userMail;
    this.user = user;
  }

  toJSON({ includeTokens = process.env.NODE_ENV !== 'production', csrfToken = null } = {}) {
    return {
      ...(includeTokens
        ? {
            access_token: this.accessToken,
            refresh_token: this.refreshToken
          }
        : {}),
      ...(csrfToken ? { csrf_token: csrfToken } : {}),
      ...(this.userMail != null ? { user: this.userMail } : {}),
      ...(this.user != null ? { user_data: this.user } : {})
    };
  }
}

module.exports = AuthTokensDTO;
