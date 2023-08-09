'use client';

import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { AppStateProvider } from '@/components/app-context';
import { useApollo } from '@/lib/apollo-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const apolloClient = useApollo({});

  return (
    <AppStateProvider>
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ApolloProvider>
    </AppStateProvider>
  );
}
