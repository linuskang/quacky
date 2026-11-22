// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class SystemDebug extends APIResource {
  /**
   * Get server, database, and activity debug metrics (requires Stats for Nerds).
   *
   * **Auth:** Session + 'Stats for Nerds' enabled required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.systemDebug.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/system.debug', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Send a test PWA push notification to the signed-in user.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.systemDebug.testPush();
   * ```
   */
  testPush(options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/system.testPush', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Trigger a test event in Upstream.
   *
   * **Auth:** Public (no session required)
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.systemDebug.test();
   * ```
   */
  test(options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/system.test', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}
