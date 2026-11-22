// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';
import { multipartFormRequestOptions } from '../internal/uploads';

export class Uploads extends APIResource {
  /**
   * Upload a file via multipart FormData (`file` field) and return its public storage URL.
   *
   * **Auth:** Authenticated session required
   *
   * tRPC multipart mutation procedure. Submit `multipart/form-data` directly via POST.
   *
   * @param {UploadUploadFileParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns tRPC success envelope (`{ result: { data: ... } }`).
   *
   * @example
   * ```ts
   * await client.uploads.uploadFile({});
   * ```
   */
  uploadFile(body: UploadUploadFileParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post(
      '/api/trpc/upload.file',
      multipartFormRequestOptions(
        { body, ...options, headers: buildHeaders([{ Accept: '*/*' }, options?.headers]) },
        this._client,
      ),
    );
  }
}

export type UploadUploadFileParams = Record<string, unknown>;
export declare namespace Uploads {
  export { type UploadUploadFileParams as UploadUploadFileParams };
}
