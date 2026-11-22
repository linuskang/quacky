// File generated from our OpenAPI spec by Scalar. See README.md for details.

export { QuackyTRPCAPI as default } from './client.js';

export { type Uploadable, toFile } from './core/uploads';
export { APIPromise } from './api-promise';
export { QuackyTRPCAPI, type ClientOptions, type AuthTokenProvider } from './client.js';
export {
  QuackyTRPCAPIError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
} from './error';
