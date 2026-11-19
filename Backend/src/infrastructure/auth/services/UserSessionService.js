const { Op } = require('sequelize');
const { UserSession } = require('../../models');
const SessionRevocationService = require('./SessionRevocationService');
const { getClientDetails } = require('../utils/clientInfo');

class UserSessionService {
  constructor(options = {}) {
    this.sessionModel = options.sessionModel || UserSession;
    this.revocationService = options.revocationService || SessionRevocationService.getInstance();
    this.touchCache = new Map(); // sid -> timestamp ms of last touch in DB
  }

  static getInstance() {
    if (!UserSessionService._instance) {
      UserSessionService._instance = new UserSessionService();
    }
    return UserSessionService._instance;
  }

  /**
   * Registra una nueva sesión en la base de datos vinculada al `sid` del token JWT.
   */
  async createSession({ sid, userId, req, expiresInDays = 30, rememberMe = true }) {
    if (!sid || !userId) return null;
    const client = getClientDetails(req);
    const now = new Date();
    const effectiveDays = rememberMe === false ? 1 : (expiresInDays || 30);
    const expiresAt = new Date(now.getTime() + effectiveDays * 24 * 3600 * 1000);

    try {
      const session = await this.sessionModel.create({
        id: sid,
        user_id: userId,
        ip_address: client.ip,
        user_agent: client.userAgent,
        client_name: client.clientName,
        is_revoked: false,
        created_at: now,
        last_active_at: now,
        expires_at: expiresAt
      });
      return session;
    } catch (err) {
      console.error('[UserSessionService] Error creating session in DB:', err.message);
      return null;
    }
  }

  /**
   * Actualiza periódicamente `last_active_at` en background (cada 5 minutos por sesión).
   */
  async touchSession(sid) {
    if (!sid) return;
    const now = Date.now();
    const lastTouch = this.touchCache.get(sid) || 0;
    if (now - lastTouch < 5 * 60 * 1000) {
      return; // Aún dentro de la ventana de amortiguación
    }

    this.touchCache.set(sid, now);
    try {
      await this.sessionModel.update(
        { last_active_at: new Date(now) },
        { where: { id: sid, is_revoked: false } }
      );
    } catch (_) {
      // Ignorar errores transitorios de touch
    }
  }

  /**
   * Obtiene todas las sesiones activas (no revocadas y no expiradas) del usuario.
   */
  async getUserSessions(userId, currentSid) {
    if (!userId) return [];
    const now = new Date();

    const sessions = await this.sessionModel.findAll({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: { [Op.gt]: now }
      },
      order: [['last_active_at', 'DESC']]
    });

    return sessions.map((s) => ({
      id: s.id,
      clientName: s.client_name || 'Navegador Web',
      ipAddress: s.ip_address || 'Desconocida',
      userAgent: s.user_agent,
      isCurrent: s.id === currentSid,
      createdAt: s.created_at,
      lastActiveAt: s.last_active_at,
      expiresAt: s.expires_at
    }));
  }

  /**
   * Revoca una sesión por su identificador único `sid` (ej: durante el logout).
   */
  async revokeSessionBySid(sid) {
    if (!sid) return false;
    try {
      await this.sessionModel.update(
        { is_revoked: true },
        { where: { id: sid } }
      );
      await this.revocationService.revokeSession(sid, 7 * 24 * 3600);
      this.touchCache.delete(sid);
      return true;
    } catch (err) {
      console.error('[UserSessionService] Error revoking session by sid:', err.message);
      return false;
    }
  }

  /**
   * Revoca una sesión específica verificando pertenencia al usuario.
   */
  async revokeSession(userId, sessionId) {
    if (!userId || !sessionId) return false;

    const session = await this.sessionModel.findOne({
      where: { id: sessionId, user_id: userId }
    });

    if (!session) {
      const err = new Error('Sesión no encontrada');
      err.code = 'SESSION_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    await this.sessionModel.update({ is_revoked: true }, { where: { id: sessionId } });
    await this.revocationService.revokeSession(sessionId, 7 * 24 * 3600);
    this.touchCache.delete(sessionId);

    return true;
  }

  /**
   * Revoca todas las sesiones activas del usuario excepto la actual.
   */
  async revokeOtherSessions(userId, currentSid) {
    if (!userId) return 0;
    const now = new Date();

    const whereClause = {
      user_id: userId,
      is_revoked: false,
      expires_at: { [Op.gt]: now }
    };

    if (currentSid) {
      whereClause.id = { [Op.ne]: currentSid };
    }

    const otherSessions = await this.sessionModel.findAll({
      where: whereClause,
      attributes: ['id']
    });

    if (otherSessions.length === 0) return 0;

    const sessionIds = otherSessions.map((s) => s.id);

    await this.sessionModel.update(
      { is_revoked: true },
      { where: { id: { [Op.in]: sessionIds } } }
    );

    for (const sid of sessionIds) {
      await this.revocationService.revokeSession(sid, 7 * 24 * 3600);
      this.touchCache.delete(sid);
    }

    return sessionIds.length;
  }
}

module.exports = UserSessionService;
