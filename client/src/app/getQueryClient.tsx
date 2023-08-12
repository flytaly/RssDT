import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/* Create a request-scoped singleton instance of QueryClient.
 * This ensures that data is not shared between different users and requests, while still only creating the QueryClient once per request.
 * https://tanstack.com/query/latest/docs/react/guides/ssr#streaming-suspense-and-server-side-fetching
 * */
export const getQueryClient = cache(() => new QueryClient());
