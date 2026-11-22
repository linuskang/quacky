// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Posts extends APIResource {
  /**
   * Fetch a post feed (recent, following, popular, or foryou), optionally filtered by hashtag.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {PostFeedParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.feed();
   * ```
   */
  feed(query: PostFeedParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/posts.feed', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get a single post with its comments and engagement state, recording a view.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {PostIDParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.id();
   * ```
   */
  id(query: PostIDParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/posts.byId', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Create a new post with up to 2 attachments.
   *
   * **Auth:** Session + unlocked posting module required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.create({
   *   content: 'x',
   *   attachments: [],
   * });
   * ```
   */
  create(body: PostCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.create', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Edit the content of a post owned by the signed-in user.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.update({
   *   id: 'x',
   *   content: 'x',
   * });
   * ```
   */
  update(body: PostUpdateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.update', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Delete a post (owner or admin).
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostDeleteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.delete({
   *   id: 'x',
   * });
   * ```
   */
  delete(body: PostDeleteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.delete', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Like a post.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostLikeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.like({
   *   id: 'x',
   * });
   * ```
   */
  like(body: PostLikeParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.like', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Remove a like from a post.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostUnlikeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.unlike({
   *   id: 'x',
   * });
   * ```
   */
  unlike(body: PostUnlikeParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.unlike', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Bookmark a post.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostBookmarkParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.bookmark({
   *   id: 'x',
   * });
   * ```
   */
  bookmark(body: PostBookmarkParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.bookmark', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Remove a post from bookmarks.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostUnbookmarkParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.unbookmark({
   *   id: 'x',
   * });
   * ```
   */
  unbookmark(body: PostUnbookmarkParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.unbookmark', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Repost an existing post.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostRepostParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.repost({
   *   postId: 'x',
   * });
   * ```
   */
  repost(body: PostRepostParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.repost', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Quote-repost an existing post with commentary.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostQuoteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.quote({
   *   postId: 'x',
   *   content: 'x',
   * });
   * ```
   */
  quote(body: PostQuoteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.quote', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Report a post for moderation review.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {PostReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.posts.report({
   *   id: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: PostReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/posts.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface PostFeedParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface PostIDParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface PostCreateParams {
  /**
   * @minLength 1
   * @maxLength 400
   */
  content: string;
  /**
   * @maxItems 2
   */
  attachments: Array<PostCreateParams.Attachment>;
}

export namespace PostCreateParams {
  export interface Attachment {
    /**
     * @minLength 1
     */
    name: string;
    /**
     * @minLength 1
     */
    url: string;
    type?: string | null;
  }
}

export interface PostUpdateParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   * @maxLength 400
   */
  content: string;
}

export interface PostDeleteParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface PostLikeParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface PostUnlikeParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface PostBookmarkParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface PostUnbookmarkParams {
  /**
   * @minLength 1
   */
  id: string;
}

export interface PostRepostParams {
  /**
   * @minLength 1
   */
  postId: string;
}

export interface PostQuoteParams {
  /**
   * @minLength 1
   */
  postId: string;
  /**
   * @minLength 1
   * @maxLength 400
   */
  content: string;
}

export interface PostReportParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace Posts {
  export {
    type PostFeedParams as PostFeedParams,
    type PostIDParams as PostIDParams,
    type PostCreateParams as PostCreateParams,
    type PostUpdateParams as PostUpdateParams,
    type PostDeleteParams as PostDeleteParams,
    type PostLikeParams as PostLikeParams,
    type PostUnlikeParams as PostUnlikeParams,
    type PostBookmarkParams as PostBookmarkParams,
    type PostUnbookmarkParams as PostUnbookmarkParams,
    type PostRepostParams as PostRepostParams,
    type PostQuoteParams as PostQuoteParams,
    type PostReportParams as PostReportParams,
  };
}
