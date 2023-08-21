import { usePathname } from 'next/navigation';
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

const FeedNavBar = () => {
  const pathname = usePathname();
  return <CardNavBar title="Feeds" routes={routes} activePath={pathname} />;
};

export default FeedNavBar;
