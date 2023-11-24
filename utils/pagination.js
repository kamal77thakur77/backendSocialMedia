async function paginateResults(page, limit, totalCount) {
  const currentPage = parseInt(page);
  const perPage = parseInt(limit);

  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (currentPage - 1) * perPage;
  return {
    startIndex,
    limit: perPage,
    totalPages,
  };
}

module.exports = { paginateResults };
