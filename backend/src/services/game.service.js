const logger = require('../utils/logger');
const GameModel = require('../models/Game.model');

/**
 * Service for managing game-related business logic.
 */
const gameService = {
  /**
   * Lists games for the public catalog. DB-backed listing is not wired yet.
   *
   * @returns {Promise<{ games: Array }>}
   */
  listGames: async () => {
    return { games: [] };
  },

  /**
   * Fetches recent games with pagination metadata.
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<{items: Array, page: number, pageSize: number, total: number, totalPages: number}>}
   */
  getRecentGames: async (params) => {
    const { items, total, page, pageSize } = await GameModel.findRecent(params);
    const totalPages = Math.ceil(total / pageSize) || 0;

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  },

  /**
   * Placeholder for simple play flow until contract + persistence are integrated.
   *
   * @param {Object} payload
   * @param {number|string} payload.userId
   * @param {string} payload.gameType
   * @returns {Promise<{ success: boolean }>}
   */
  playSimpleGame: async ({ userId, gameType }) => {
    logger.info(`User ${userId} playing ${gameType}`);
    return { success: true };
  },
};

module.exports = gameService;
