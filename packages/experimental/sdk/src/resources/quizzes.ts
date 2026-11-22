// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Quizzes extends APIResource {
  /**
   * List all available onboarding/feature quizzes.
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
   * await client.quizzes.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/quiz.list', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Get a quiz's metadata and shuffled questions by slug/ID.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC query procedure. Pass JSON-encoded input in the `input` query parameter.
   *
   * @param {QuizSlugParams} [query] - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.quizzes.slug();
   * ```
   */
  slug(query: QuizSlugParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
    return this._client.get('/api/trpc/quiz.bySlug', {
      query,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Grade quiz answers; awards XP and unlocks the corresponding feature module on pass, or returns wrong question numbers and AI feedback.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC mutation procedure. Submit JSON input in the request body.
   *
   * @param {QuizSubmitParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.quizzes.submit({
   *   id: 'x',
   *   answers: {},
   * });
   * ```
   */
  submit(body: QuizSubmitParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/trpc/quiz.submit', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface QuizSlugParams {
  /**
   * URL-encoded JSON input object matching the procedure's Zod schema.
   */
  input?: string;
}

export interface QuizSubmitParams {
  /**
   * @minLength 1
   */
  id: string;
  answers: Record<string, string>;
}
export declare namespace Quizzes {
  export { type QuizSlugParams as QuizSlugParams, type QuizSubmitParams as QuizSubmitParams };
}
