'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

import CardNavBar, { CardRoute } from './nav-bar';

const routes: CardRoute[] = [
  {
    name: 'View',
    path: '/feed',
  },
  {
    name: 'Manage digests',
    path: '/manage',
  },
  {
    name: 'Import/Export',
    path: '/import-export',
  },
];

function getRoutes(params?: string) {
  if (!params) return routes;
  return routes.map((r) => ({ ...r, path: r.path + params }));
}

const FeedNavBar = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const stretch = params?.get('stretch');

  const updatedRoutes = getRoutes(stretch ? '?stretch=true' : '');

  return (
    <CardNavBar title="Feeds" routes={updatedRoutes} activePath={pathname} withMaximize={true} />
  );
};

export default FeedNavBar;
