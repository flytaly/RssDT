import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { AppStateProvider } from '@/components/app-context';
import { useApollo } from '@/lib/apollo-client';
import type { PathHistory } from '@/types';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [pathHistory, setPathHistory] = useState<PathHistory>({ currentPath: '', prevPath: '' });
  const apolloClient = useApollo(pageProps);
  const router = useRouter();

  useEffect(() => {
    setPathHistory((h) => ({ prevPath: h.currentPath, currentPath: router.asPath }));
  }, [router.asPath]);

  return (
    <AppStateProvider>
      <ApolloProvider client={apolloClient}>
        <Component pathHistory={pathHistory} {...pageProps} />
      </ApolloProvider>
    </AppStateProvider>
  );
}

export default MyApp;
