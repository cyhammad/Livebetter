import type { ApiErrorResponse } from "types";

/**
 * Generic method that handles errors from the API and properly throws them.
 * This function should be used in any fetcher functions that get passed to
 * react-query. It has the same parameters as `fetch`.
 *
 * Errors responses should contain an `error` object with a `message` property
 * in order for them to be handled properly by react-query.
 *
 * @link https://fetch.spec.whatwg.org/#fetch-method
 */
export async function request<TResponse = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<TResponse> {
  const response = await fetch(input, init);

  const responseJson: ApiErrorResponse | TResponse = await response.json();

  const isErrorResponse = "error" in responseJson;

  if (!response.ok || isErrorResponse) {
    if (isErrorResponse) {
      throw new Error(responseJson.error.message);
    }

    throw new Error(response.statusText);
  }

  return responseJson;
}
