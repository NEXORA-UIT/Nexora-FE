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
