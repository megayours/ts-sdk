export class Paginator<T> {
  readonly fetchNext: () => Promise<Paginator<T>>;
  readonly data: T[];

  constructor(fetchNext: () => Promise<Paginator<T>>, data: T[]) {
    this.fetchNext = fetchNext;
    this.data = data;
  }
}

export type PaginatedResult<T> = {
  data: T[];
  next_cursor: string | null;
};

export type PaginationParams = {
  page_size: number | null;
  page_cursor: string | null;
};

export function createPaginator<T>(
  queryFn: (params: PaginationParams) => Promise<PaginatedResult<T>>,
  pageSize?: number,
  initialPageCursor?: string
): Promise<Paginator<T>> {
  const OUT_OF_PAGES = 'OUT_OF_PAGES';

  const fetchNext = async (
    currentCursor: string | undefined
  ): Promise<Paginator<T>> => {
    if (currentCursor === OUT_OF_PAGES) {
      return new Paginator(() => fetchNext(currentCursor), []);
    }

    const result = await queryFn({
      page_size: pageSize || null,
      page_cursor: currentCursor || null,
    });

    const nextCursor = result.next_cursor || OUT_OF_PAGES;
    return new Paginator(() => fetchNext(nextCursor), result.data);
  };

  return fetchNext(initialPageCursor);
}
