import '@/styles/globals.css';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import Link from 'next/link';
import React from 'react';

import Header from '@/components/header/header';
import { metadata } from '@/components/meta';
import { getGQLServerClient } from '@/lib/gqlClient.server';

import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

function getCookie() {
  const headersInstance = headers();
  return headersInstance.get('cookie') ?? '';
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center text-sm text-gray-400 mt-8 mb-3 space-x-2">
      <span>{currentYear}</span>
      <Link href="/help" className="hover:underline">
        Help
      </Link>
      <Link href="/contacts" className="hover:underline">
        Contacts
      </Link>
    </footer>
  );
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const gqlClient = await getGQLServerClient();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['me'],
    queryFn: async () => {
      return gqlClient.me({}, { cookie: getCookie() });
    },
  });
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex justify-center max-w-screen min-h-screen bg-gradient-to-b from-gradFrom to-gradTo bg-fixed pt-2">
            <div className="flex flex-col flex-grow max-w-max">
              <HydrationBoundary state={dehydrate(queryClient)}>
                <Header />
                {children}
                <div className="mt-auto" />
                <Footer />
              </HydrationBoundary>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default Layout;
