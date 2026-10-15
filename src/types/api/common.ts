/**
 * Shared API contract types for HTTP communication across all domains.
 */

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorObject {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorObject;
}

export interface EmptySuccessData {
  [key: string]: never;
}

/**
 * Standard pagination metadata envelope shared across paginated API responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
