export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

export class ApiResponse<T = unknown> {
  constructor(
    public readonly data: T,
    public readonly message?: string,
    public readonly meta?: Record<string, unknown>,
  ) {}

  toJSON(): ApiSuccessResponse<T> {
    const res: ApiSuccessResponse<T> = {
      success: true,
      data: this.data,
    };

    if (this.message) res.message = this.message;
    if (this.meta) res.meta = this.meta;

    return res;
  }
}
