export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: string[];
  data: null;

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}