export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthenticated") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Unauthorized access") {
    super(403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: any) {
    super(400, message, errors);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

