// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class WarmFuzzies extends APIResource {
  /**
   * Fetch warm fuzzies received by the signed-in user and mark them as read.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.warmFuzzies.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/fuzzies.list', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Send an anonymous warm fuzzy to another user.
   *
   * **Auth:** Session + unlocked Warm Fuzzies module required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {WarmFuzzySendParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.warmFuzzies.send({
   *   receiverId: 'x',
   *   message: 'x',
   * });
   * ```
   */
  send(body: WarmFuzzySendParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/fuzzies.send', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Report an inappropriate warm fuzzy.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {WarmFuzzyReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.warmFuzzies.report({
   *   id: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: WarmFuzzyReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/fuzzies.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface WarmFuzzySendParams {
  /**
   * @minLength 1
   */
  receiverId: string;
  /**
   * @minLength 1
   */
  message: string;
}

export interface WarmFuzzyReportParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace WarmFuzzies {
  export {
    type WarmFuzzySendParams as WarmFuzzySendParams,
    type WarmFuzzyReportParams as WarmFuzzyReportParams,
  };
}
