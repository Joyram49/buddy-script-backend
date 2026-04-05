export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function getPagination(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 10);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
