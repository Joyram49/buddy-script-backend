export type ApiErrorResponse = {
  success: false;
  code: string;
  message?: string;
  details?: unknown;
  issues?: unknown;
};

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly issues?: unknown;

  constructor(params: {
    statusCode: number;
    code: string;
    message?: string;
    details?: unknown;
    issues?: unknown;
  }) {
    super(params.message ?? params.code);
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
    this.issues = params.issues;
  }

  toResponse(): ApiErrorResponse {
    const res: ApiErrorResponse = {
      success: false,
      code: this.code,
    };
    if (this.message) res.message = this.message;
    if (this.details !== undefined) res.details = this.details;
    if (this.issues !== undefined) res.issues = this.issues;
    return res;
  }
}
