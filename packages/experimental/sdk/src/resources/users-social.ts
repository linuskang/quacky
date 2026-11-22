// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class UsersSocial extends APIResource {
  /**
   * Get a user's profile by handle.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {UsersSocialHandleParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.handle();
   * ```
   */
  handle(query: UsersSocialHandleParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/users.byHandle', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Search unbanned users by username prefix/substring for mentions or recipient pickers.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {UsersSocialMentionsParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.mentions();
   * ```
   */
  mentions(
    query: UsersSocialMentionsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get('/api/trpc/users.mentions', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get up to 3 suggested users to follow.
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
   * await client.usersSocial.suggested();
   * ```
   */
  suggested(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/users.suggested', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List followers of a public user, with optional search.
   *
   * **Auth:** Public (no session required)
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {UsersSocialFollowersParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.followers();
   * ```
   */
  followers(
    query: UsersSocialFollowersParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get('/api/trpc/users.followers', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List accounts followed by a public user, with optional search.
   *
   * **Auth:** Public (no session required)
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {UsersSocialFollowingParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.following();
   * ```
   */
  following(
    query: UsersSocialFollowingParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get('/api/trpc/users.following', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Follow a user by handle.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {UsersSocialFollowParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.follow({
   *   handle: 'x',
   * });
   * ```
   */
  follow(body: UsersSocialFollowParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/users.follow', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Unfollow a user by handle.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {UsersSocialUnfollowParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.unfollow({
   *   handle: 'x',
   * });
   * ```
   */
  unfollow(body: UsersSocialUnfollowParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/users.unfollow', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Report a user profile for moderation review.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {UsersSocialReportParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.usersSocial.report({
   *   handle: 'x',
   *   reason: 'x',
   * });
   * ```
   */
  report(body: UsersSocialReportParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/users.report', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface UsersSocialHandleParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface UsersSocialMentionsParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface UsersSocialFollowersParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface UsersSocialFollowingParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface UsersSocialFollowParams {
  /**
   * @minLength 1
   */
  handle: string;
}

export interface UsersSocialUnfollowParams {
  /**
   * @minLength 1
   */
  handle: string;
}

export interface UsersSocialReportParams {
  /**
   * @minLength 1
   */
  handle: string;
  /**
   * @minLength 1
   */
  reason: string;
}
export declare namespace UsersSocial {
  export {
    type UsersSocialHandleParams as UsersSocialHandleParams,
    type UsersSocialMentionsParams as UsersSocialMentionsParams,
    type UsersSocialFollowersParams as UsersSocialFollowersParams,
    type UsersSocialFollowingParams as UsersSocialFollowingParams,
    type UsersSocialFollowParams as UsersSocialFollowParams,
    type UsersSocialUnfollowParams as UsersSocialUnfollowParams,
    type UsersSocialReportParams as UsersSocialReportParams,
  };
}
