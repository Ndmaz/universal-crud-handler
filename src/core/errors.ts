//the error classes
//cruderror
export class CrudError extends Error {
  status: number;
// a constructorwith message and a status param
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export class ModelNotFoundError extends CrudError {
  constructor(model: string) {
    super(`Model '${model}' not found`, 404);
  }
}

export class ActionNotAllowedError extends CrudError {
  constructor(action: string) {
    super(`Action '${action}' not allowed`, 403);
  }
}

export class UnauthorizedError extends CrudError {
  constructor() {
    super("Authentication required", 401);
  }
}

export class ForbiddenError extends CrudError {
  constructor() {
    super("Forbidden", 403);
  }
}

export class RateLimitExceededError extends CrudError {
  constructor() {
    super("Too many requests", 429);
  }
}
