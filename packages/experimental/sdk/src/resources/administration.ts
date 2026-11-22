// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Administration extends APIResource {
  /**
   * Get aggregate wellbeing check-in statistics (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.stats();
   * ```
   */
  stats(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/admin.stats', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Invite and create a new user with a temporary password (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationInviteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.invite({
   *   email: 'user@example.com',
   *   role: 'admin',
   *   displayName: 'x',
   *   username: 'x',
   * });
   * ```
   */
  invite(body: AdministrationInviteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.invite', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Update global site feature lock state (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationLockParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.lock({
   *   locked: false,
   * });
   * ```
   */
  lock(body: AdministrationLockParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.lock', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Broadcast a notification to all accounts (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationBroadcastNotificationParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.broadcastNotification({
   *   userId: 'quacky',
   *   content: 'x',
   * });
   * ```
   */
  broadcastNotification(
    body: AdministrationBroadcastNotificationParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.post('/api/trpc/admin.broadcastNotification', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List all user accounts (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.usersList();
   * ```
   */
  usersList(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/admin.usersList', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get a full user record by handle (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {AdministrationUserByHandleParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.userByHandle();
   * ```
   */
  userByHandle(
    query: AdministrationUserByHandleParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get('/api/trpc/admin.userByHandle', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Update a user's fields and audit changes (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationUserUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.userUpdate({
   *   name: 'x',
   *   username: 'x',
   *   email: 'user@example.com',
   *   emailVerified: false,
   *   image: 'x',
   *   verified: false,
   *   statsForNerds: false,
   *   private: false,
   *   streamerMode: false,
   *   hideTips: false,
   *   bio: '',
   *   bannerImage: '',
   *   pronoun: '',
   *   location: '',
   *   website: '',
   *   role: '',
   *   banned: false,
   *   banReason: '',
   *   banExpires: {},
   *   parentEmail: '',
   *   unlockedPosting: false,
   *   unlockedCommenting: false,
   *   unlockedDms: false,
   *   unlockedFuzzies: false,
   *   unlockedProfiles: false,
   *   xp: 0,
   *   points: 0,
   *   pushNotificationsEnabled: false,
   *   handle: 'x',
   * });
   * ```
   */
  userUpdate(body: AdministrationUserUpdateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.userUpdate', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List pending shop orders (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.ordersList();
   * ```
   */
  ordersList(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/admin.ordersList', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Fulfill or reject a pending shop order (refunding points and restoring stock on rejection; admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationOrdersUpdateStatusParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.ordersUpdateStatus({
   *   orderId: 'x',
   *   actionOrderStatus: 'FULFILLED',
   * });
   * ```
   */
  ordersUpdateStatus(
    body: AdministrationOrdersUpdateStatusParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.post('/api/trpc/admin.ordersUpdateStatus', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Delete a shop order (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationOrdersDeleteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.ordersDelete({
   *   orderId: 'x',
   * });
   * ```
   */
  ordersDelete(body: AdministrationOrdersDeleteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.ordersDelete', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List all shop items including unavailable ones (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.shopItemsList();
   * ```
   */
  shopItemsList(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/admin.shopItemsList', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Create a new shop item (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationShopItemsCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.shopItemsCreate({
   *   name: 'x',
   *   description: 'x',
   *   price: 0,
   *   stock: 0,
   *   category: 'x',
   *   imageUrl: 'x',
   *   available: false,
   *   featured: false,
   * });
   * ```
   */
  shopItemsCreate(body: AdministrationShopItemsCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.shopItemsCreate', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Update an existing shop item (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationShopItemsUpdateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.shopItemsUpdate({
   *   id: 'x',
   * });
   * ```
   */
  shopItemsUpdate(body: AdministrationShopItemsUpdateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.shopItemsUpdate', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Delete a shop item by ID (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {AdministrationShopItemsDeleteParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.administration.shopItemsDelete({
   *   id: 'x',
   * });
   * ```
   */
  shopItemsDelete(body: AdministrationShopItemsDeleteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/admin.shopItemsDelete', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface AdministrationInviteParams {
  /**
   * @format email
   * @pattern ^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$
   */
  email: string;
  role: 'admin' | 'user';
  /**
   * @minLength 1
   */
  displayName: string;
  /**
   * @minLength 1
   */
  username: string;
}

export interface AdministrationLockParams {
  locked: boolean;
}

export interface AdministrationBroadcastNotificationParams {
  /**
   * @minLength 1
   */
  userId: string;
  /**
   * @minLength 1
   */
  content: string;
}

export interface AdministrationUserByHandleParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface AdministrationUserUpdateParams {
  /**
   * @minLength 1
   */
  name: string;
  /**
   * @minLength 1
   */
  username: string;
  /**
   * @format email
   * @pattern ^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$
   */
  email: string;
  emailVerified: boolean;
  /**
   * @minLength 1
   */
  image: string;
  verified: boolean;
  statsForNerds: boolean;
  private: boolean;
  streamerMode: boolean;
  hideTips: boolean;
  bio: string | null;
  bannerImage: string | null;
  pronoun: string | null;
  location: string | null;
  website: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: unknown | null;
  parentEmail: string | null;
  unlockedPosting: boolean;
  unlockedCommenting: boolean;
  unlockedDms: boolean;
  unlockedFuzzies: boolean;
  unlockedProfiles: boolean;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  xp: number;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  points: number;
  pushNotificationsEnabled: boolean;
  /**
   * @minLength 1
   */
  handle: string;
}

export interface AdministrationOrdersUpdateStatusParams {
  /**
   * @minLength 1
   */
  orderId: string;
  actionOrderStatus: 'FULFILLED' | 'REJECTED';
}

export interface AdministrationOrdersDeleteParams {
  /**
   * @minLength 1
   */
  orderId: string;
}

export interface AdministrationShopItemsCreateParams {
  /**
   * @minLength 1
   */
  name: string;
  /**
   * @minLength 1
   */
  description: string;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  price: number;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  stock: number;
  /**
   * @minLength 1
   */
  category: string;
  /**
   * @minLength 1
   */
  imageUrl: string;
  available: boolean;
  featured: boolean;
}

export interface AdministrationShopItemsUpdateParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minLength 1
   */
  name?: string;
  /**
   * @minLength 1
   */
  description?: string;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  price?: number;
  /**
   * @minimum 0
   * @maximum 9007199254740991
   */
  stock?: number;
  /**
   * @minLength 1
   */
  category?: string;
  /**
   * @minLength 1
   */
  imageUrl?: string;
  available?: boolean;
  featured?: boolean;
}

export interface AdministrationShopItemsDeleteParams {
  /**
   * @minLength 1
   */
  id: string;
}
export declare namespace Administration {
  export {
    type AdministrationInviteParams as AdministrationInviteParams,
    type AdministrationLockParams as AdministrationLockParams,
    type AdministrationBroadcastNotificationParams as AdministrationBroadcastNotificationParams,
    type AdministrationUserByHandleParams as AdministrationUserByHandleParams,
    type AdministrationUserUpdateParams as AdministrationUserUpdateParams,
    type AdministrationOrdersUpdateStatusParams as AdministrationOrdersUpdateStatusParams,
    type AdministrationOrdersDeleteParams as AdministrationOrdersDeleteParams,
    type AdministrationShopItemsCreateParams as AdministrationShopItemsCreateParams,
    type AdministrationShopItemsUpdateParams as AdministrationShopItemsUpdateParams,
    type AdministrationShopItemsDeleteParams as AdministrationShopItemsDeleteParams,
  };
}
