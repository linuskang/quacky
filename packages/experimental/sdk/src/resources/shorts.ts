// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Shorts extends APIResource {
  /**
   * List unflagged short videos.
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
   * await client.shorts.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shorts.list', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get a single short video by ID.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {ShortIDParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shorts.id();
   * ```
   */
  id(query: ShortIDParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shorts.byId', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Upload a short video via multipart FormData (`video` file and optional `description`).
   *
   * **Auth:** Authenticated session required
   *
   * tRPC multipart mutation procedure. Submit `multipart/form-data` directly via POST.
   *
   * @param {ShortCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shorts.create({});
   * ```
   */
  create(body: ShortCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      '/api/trpc/shorts.create',
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }

  /**
   * Report a short video for moderation review.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShortReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shorts.report({
   *   id: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: ShortReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/shorts.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface ShortIDParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export type ShortCreateParams = Record<string, unknown>;

export interface ShortReportParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace Shorts {
  export {
    type ShortIDParams as ShortIDParams,
    type ShortCreateParams as ShortCreateParams,
    type ShortReportParams as ShortReportParams,
  };
}
