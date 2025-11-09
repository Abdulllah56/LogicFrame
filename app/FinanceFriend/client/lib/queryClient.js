import { QueryClient } from "@tanstack/react-query";

/**
 * Throws an error if the fetch Response status is not OK (200-299).
 * @param {Response} res The fetch Response object.
 */
async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Executes an authenticated API request.
 * @param {string} method The HTTP method (GET, POST, PUT, DELETE).
 * @param {string} url The request URL.
 * @param {any} [data] The body data for POST/PUT requests.
 * @returns {Promise<Response>} The fetch Response object.
 */
export async function apiRequest(
  method,
  url,
  data,
) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Ensure cookies/auth are sent
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Creates a default query function for react-query.
 * @param {{ on401: "returnNull" | "throw" }} options Options for handling 401 Unauthorized status.
 * @returns {import('@tanstack/react-query').QueryFunction} The query function.
 */
export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // queryKey[0] is typically the endpoint string
    const res = await fetch(queryKey[0], {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * The global QueryClient instance configured with default options.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use 'throw' by default for 401s in queries
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Data is considered fresh forever unless explicitly invalidated
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});