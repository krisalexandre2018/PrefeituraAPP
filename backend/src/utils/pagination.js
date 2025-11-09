/**
 * Validar e sanitizar parâmetros de paginação
 * @param {Object} query - Query parameters do request
 * @param {Object} options - Opções de configuração
 * @returns {Object} Parâmetros validados
 */
function validatePagination(query, options = {}) {
  const defaults = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  };

  const config = { ...defaults, ...options };

  // Validar e sanitizar page
  let page = parseInt(query.page) || config.defaultPage;
  page = Math.max(1, page); // Mínimo 1

  // Validar e sanitizar limit
  let limit = parseInt(query.limit) || config.defaultLimit;
  limit = Math.max(1, Math.min(limit, config.maxLimit)); // Entre 1 e maxLimit

  // Calcular skip
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
}

/**
 * Formatar resposta paginada
 * @param {Array} data - Dados
 * @param {Number} total - Total de registros
 * @param {Object} pagination - Parâmetros de paginação
 * @returns {Object} Resposta formatada
 */
function formatPaginatedResponse(data, total, pagination) {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

module.exports = {
  validatePagination,
  formatPaginatedResponse
};
