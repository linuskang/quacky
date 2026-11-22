// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Comments extends APIResource {
  /**
   * Get a comment, its parent post, sibling comments, and relevant users.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {CommentIDParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.comments.id();
   * ```
   */
  id(query: CommentIDParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/comments.byId', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Create a comment on a post.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CommentCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.comments.create({
   *   postId: 'x',
   *   content: 'x',
   * });
   * ```
   */
  create(body: CommentCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/comments.create', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Delete a comment (owner or admin).
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CommentDeleteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.comments.delete({
   *   id: 'x',
   * });
   * ```
   */
  delete(body: CommentDeleteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/comments.delete', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Report a comment for moderation review.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CommentReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.comments.report({
   *   id: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: CommentReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/comments.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface CommentIDParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface CommentCreateParams {
  /**
   * @minLength 1
   */
  postId: string;
  /**
   * @minLength 1
   * @maxLength 100
   */
  content: string;
}

export interface CommentDeleteParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface CommentReportParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace Comments {
  export {
    type CommentIDParams as CommentIDParams,
    type CommentCreateParams as CommentCreateParams,
    type CommentDeleteParams as CommentDeleteParams,
    type CommentReportParams as CommentReportParams,
  };
}
