const { config } = require("../config");

function parsePagination(query) {
  let page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || config.pagination.defaultLimit;
  limit = Math.min(limit, config.pagination.maxLimit);

  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginatedResponse(data, total, { page, limit }) {
  return {
    items: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
