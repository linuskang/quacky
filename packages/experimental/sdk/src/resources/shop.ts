// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Shop extends APIResource {
  /**
   * List available shop items along with the signed-in user's point balance.
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
   * await client.shop.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shop.list', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get details of a single shop item by ID.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {ShopIDParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.id();
   * ```
   */
  id(query: ShopIDParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shop.byId', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Purchase a shop item using points.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShopPurchaseParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.purchase({
   *   id: 'x',
   *   quantity: 1,
   * });
   * ```
   */
  purchase(body: ShopPurchaseParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/shop.purchase', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List the signed-in user's shop purchases.
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
   * await client.shop.myOrders();
   * ```
   */
  myOrders(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shop.myOrders', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get the signed-in user's shop wishlist and points balance.
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
   * await client.shop.wishlistList();
   * ```
   */
  wishlistList(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shop.wishlistList', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Add an item to the signed-in user's wishlist.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShopWishlistAddParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.wishlistAdd({
   *   itemId: 'x',
   * });
   * ```
   */
  wishlistAdd(body: ShopWishlistAddParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/shop.wishlistAdd', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Remove an item from the signed-in user's wishlist.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShopWishlistRemoveParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.wishlistRemove({
   *   itemId: 'x',
   * });
   * ```
   */
  wishlistRemove(body: ShopWishlistRemoveParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/shop.wishlistRemove', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List pending shop item suggestions.
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
   * await client.shop.suggestionsList();
   * ```
   */
  suggestionsList(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/shop.suggestionsList', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Submit a new shop item suggestion.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShopSuggestionsCreateParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.suggestionsCreate({
   *   name: 'x',
   *   image: 'x',
   *   description: 'x',
   * });
   * ```
   */
  suggestionsCreate(body: ShopSuggestionsCreateParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/shop.suggestionsCreate', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Update a shop suggestion's pending state (admin only).
   *
   * **Auth:** Admin role required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {ShopSuggestionsUpdateStatusParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.suggestionsUpdateStatus({
   *   id: 'x',
   *   pending: false,
   * });
   * ```
   */
  suggestionsUpdateStatus(
    body: ShopSuggestionsUpdateStatusParams,
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.post('/api/trpc/shop.suggestionsUpdateStatus', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * List votes for a given shop suggestion.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {ShopSuggestionVotesParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.shop.suggestionVotes();
   * ```
   */
  suggestionVotes(
    query: ShopSuggestionVotesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<void> {
    return this._client.get('/api/trpc/shop.suggestionVotes', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface ShopIDParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface ShopPurchaseParams {
  /**
   * @minLength 1
   */
  id: string;
  /**
   * @minimum 1
   * @maximum 9007199254740991
   */
  quantity: number;
}

export interface ShopWishlistAddParams {
  /**
   * @minLength 1
   */
  itemId: string;
}

export interface ShopWishlistRemoveParams {
  /**
   * @minLength 1
   */
  itemId: string;
}

export interface ShopSuggestionsCreateParams {
  /**
   * @minLength 1
   */
  name: string;
  /**
   * @minLength 1
   */
  image: string;
  /**
   * @minLength 1
   */
  description: string;
}

export interface ShopSuggestionsUpdateStatusParams {
  /**
   * @minLength 1
   */
  id: string;
  pending: boolean;
}

export interface ShopSuggestionVotesParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}
export declare namespace Shop {
  export {
    type ShopIDParams as ShopIDParams,
    type ShopPurchaseParams as ShopPurchaseParams,
    type ShopWishlistAddParams as ShopWishlistAddParams,
    type ShopWishlistRemoveParams as ShopWishlistRemoveParams,
    type ShopSuggestionsCreateParams as ShopSuggestionsCreateParams,
    type ShopSuggestionsUpdateStatusParams as ShopSuggestionsUpdateStatusParams,
    type ShopSuggestionVotesParams as ShopSuggestionVotesParams,
  };
}
