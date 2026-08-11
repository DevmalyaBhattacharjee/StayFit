/** Mirrors Spring Data's `Sort` JSON projection. */
interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/** Mirrors Spring Data's `Pageable` JSON projection, as nested in a `Page<T>` response. */
interface PageableInfo {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: SortInfo;
  unpaged: boolean;
}

/** Mirrors the raw `org.springframework.data.domain.Page<T>` JSON shape returned by `/workouts` and `/progress`. */
interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageableInfo;
  size: number;
  sort: SortInfo;
  totalElements: number;
  totalPages: number;
}

export type { PageResponse, PageableInfo, SortInfo };
