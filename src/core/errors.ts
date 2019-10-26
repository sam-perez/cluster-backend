/* eslint-disable max-classes-per-file */

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

export class RequestValidationFailedError extends Error {
  public validationErrors: RequestValidationError[];

  constructor(message: string, validationErrors: RequestValidationError[]) {
    super(message);
    this.validationErrors = validationErrors;
    this.name = 'RequestValidationFailedError';
  }
}

export class UserGeoLocationMissingError extends Error { }
