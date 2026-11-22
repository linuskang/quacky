// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class CurrentUser extends APIResource {
  /**
   * Get the signed-in user's check-in status, permissions, unread counts, streak, and point balance.
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
   * await client.currentUser.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/me.get', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Update the signed-in user's bio.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserUpdateBioParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.updateBio({
   *   bio: '',
   * });
   * ```
   */
  updateBio(body: CurrentUserUpdateBioParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.updateBio', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Submit today's wellbeing daily check-in.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserCheckInParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.checkIn({
   *   wellbeing: 1,
   *   happiness: 1,
   *   stress: 1,
   *   sleep: 1,
   *   energy: 1,
   *   assistance: false,
   * });
   * ```
   */
  checkIn(body: CurrentUserCheckInParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.checkIn', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get the signed-in user's configured parent email.
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
   * await client.currentUser.parentEmailGet();
   * ```
   */
  parentEmailGet(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/me.parentEmailGet', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Set a parent email and send a notification email.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserParentEmailSetParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.parentEmailSet({
   *   parentEmail: 'user@example.com',
   * });
   * ```
   */
  parentEmailSet(body: CurrentUserParentEmailSetParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.parentEmailSet', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Fetch the signed-in user's bookmarked posts.
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
   * await client.currentUser.bookmarks();
   * ```
   */
  bookmarks(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/me.bookmarks', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Fetch the signed-in user's notifications.
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
   * await client.currentUser.notifications();
   * ```
   */
  notifications(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/me.notifications', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Register a Web Push subscription for the signed-in user.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserPushSubscribeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.pushSubscribe({
   *   endpoint: 'https://example.com',
   *   keys: {
   *     auth: 'x',
   *     p256dh: 'x',
   *   },
   * });
   * ```
   */
  pushSubscribe(body: CurrentUserPushSubscribeParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.pushSubscribe', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Remove a Web Push subscription for the signed-in user.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserPushUnsubscribeParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.pushUnsubscribe({
   *   endpoint: 'x',
   * });
   * ```
   */
  pushUnsubscribe(body: CurrentUserPushUnsubscribeParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.pushUnsubscribe', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Send a test push notification to the signed-in user.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {CurrentUserPushTestParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.currentUser.pushTest({
   *   message: 'This is a test notification from Quacky!',
   * });
   * ```
   */
  pushTest(body: CurrentUserPushTestParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/me.pushTest', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface CurrentUserUpdateBioParams {
  /**
   * @maxLength 160
   */
  bio: string;
}

export interface CurrentUserCheckInParams {
  /**
   * @minimum 1
   * @maximum 5
   */
  wellbeing: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  happiness: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  stress: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  sleep: number;
  /**
   * @minimum 1
   * @maximum 5
   */
  energy: number;
  assistance: boolean;
}

export interface CurrentUserParentEmailSetParams {
  /**
   * @format email
   * @pattern ^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$
   */
  parentEmail: string;
}

export interface CurrentUserPushSubscribeParams {
  /**
   * @format uri
   */
  endpoint: string;
  keys: CurrentUserPushSubscribeParams.Keys;
}

export namespace CurrentUserPushSubscribeParams {
  export interface Keys {
    /**
     * @minLength 1
     */
    auth: string;
    /**
     * @minLength 1
     */
    p256dh: string;
  }
}

export interface CurrentUserPushUnsubscribeParams {
  /**
   * @minLength 1
   */
  endpoint: string;
}

export interface CurrentUserPushTestParams {
  /**
   * @minLength 1
   */
  message: string;
}
export declare namespace CurrentUser {
  export {
    type CurrentUserUpdateBioParams as CurrentUserUpdateBioParams,
    type CurrentUserCheckInParams as CurrentUserCheckInParams,
    type CurrentUserParentEmailSetParams as CurrentUserParentEmailSetParams,
    type CurrentUserPushSubscribeParams as CurrentUserPushSubscribeParams,
    type CurrentUserPushUnsubscribeParams as CurrentUserPushUnsubscribeParams,
    type CurrentUserPushTestParams as CurrentUserPushTestParams,
  };
}
