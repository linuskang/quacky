// File generated from our OpenAPI spec by Scalar. See README.md for details.

import type { QuackyTRPCAPI } from './client';

export abstract class APIResource {
  protected _client: QuackyTRPCAPI;

  constructor(client: QuackyTRPCAPI) {
    this._client = client;
  }
}
