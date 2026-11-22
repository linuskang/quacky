// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class DirectMessages extends APIResource {
  /**
   * List direct message conversations for the signed-in user.
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
   * await client.directMessages.conversations();
   * ```
   */
  conversations(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/dms.conversations', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Fetch direct messages between the signed-in user and another handle.
   *
   * **Auth:** Session + unlocked DMs module required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {DirectMessageListParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.directMessages.list();
   * ```
   */
  list(query: DirectMessageListParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/dms.messages', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Send a direct message to another user by handle.
   *
   * **Auth:** Session + unlocked DMs module required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {DirectMessageSendParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.directMessages.send({
   *   handle: 'x',
   *   message: 'x',
   * });
   * ```
   */
  send(body: DirectMessageSendParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/dms.send', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface DirectMessageListParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface DirectMessageSendParams {
  /**
   * @minLength 1
   */
  handle: string;
  /**
   * @minLength 1
   * @maxLength 1000
   */
  message: string;
}
export declare namespace DirectMessages {
  export {
    type DirectMessageListParams as DirectMessageListParams,
    type DirectMessageSendParams as DirectMessageSendParams,
  };
}
