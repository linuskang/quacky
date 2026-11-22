// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Memeland extends APIResource {
  /**
   * List unflagged memes with vote counts, score, and the current user's vote in a single query.
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
   * await client.memeland.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/memes.list', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get a single meme by ID with vote counts and the current user's vote.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {MemelandIDParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.memeland.id();
   * ```
   */
  id(query: MemelandIDParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/memes.byId', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Publish a new meme by uploaded image URL.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {MemelandCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.memeland.create({
   *   image: 'x',
   * });
   * ```
   */
  create(body: MemelandCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/memes.create', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Upvote or downvote a meme.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {MemelandVoteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.memeland.vote({
   *   id: 'x',
   *   type: 'UPVOTE',
   * });
   * ```
   */
  vote(body: MemelandVoteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/memes.vote', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Report an inappropriate meme.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {MemelandReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.memeland.report({
   *   id: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: MemelandReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/memes.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface MemelandIDParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface MemelandCreateParams {
  /**
   * @minLength 1
   */
  image: string;
}

export interface MemelandVoteParams {
  /**
   * @minLength 1
   */
  id: string;
  type: 'UPVOTE' | 'DOWNVOTE';
}

export interface MemelandReportParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace Memeland {
  export {
    type MemelandIDParams as MemelandIDParams,
    type MemelandCreateParams as MemelandCreateParams,
    type MemelandVoteParams as MemelandVoteParams,
    type MemelandReportParams as MemelandReportParams,
  };
}
