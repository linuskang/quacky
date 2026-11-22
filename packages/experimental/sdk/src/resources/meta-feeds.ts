// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class MetaFeeds extends APIResource {
  /**
   * Get public Quacky instance metadata, stats, rules, and QOTD.
   *
   * **Auth:** Public (no session required)
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.metaFeeds.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/meta.get', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get top trending hashtags across unflagged posts.
   *
   * **Auth:** Public (no session required)
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.metaFeeds.trending();
   * ```
   */
  trending(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/meta.trending', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Fetch and parse the ABC News RSS feed.
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
   * await client.metaFeeds.news();
   * ```
   */
  news(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/meta.news', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get top public users ranked by points.
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
   * await client.metaFeeds.leaderboard();
   * ```
   */
  leaderboard(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/meta.leaderboard', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Submit product feedback to the feedback portal.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {MetaFeedFeedbackParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.metaFeeds.feedback({
   *   usability: 1,
   *   satisfaction: 1,
   *   recommend: 1,
   *   visual: 1,
   *   comments: 'x',
   * });
   * ```
   */
  feedback(body: MetaFeedFeedbackParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/meta.feedback', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface MetaFeedFeedbackParams {
  /**
   * @minimum 1
   * @maximum 5
   */
  usability: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  satisfaction: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  recommend: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  visual: number;
  /**
   * @minLength 1
   */
  comments: string;
}
export declare namespace MetaFeeds {
  export { type MetaFeedFeedbackParams as MetaFeedFeedbackParams };
}
