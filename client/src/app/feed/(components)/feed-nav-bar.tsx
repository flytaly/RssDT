'use client';

import { usePathname } from 'next/navigation';

import CardNavBar, { CardRoute } from '@/components/card/nav-bar';

import ToggleMaximize from './toggle-maximize';

const routes: CardRoute[] = [
  {
    name: 'View',
    path: '/feed',
  },
  {
    name: 'Manage digests',
    path: '/feed/manage',
  },
  {
    name: 'Import/Export',
    path: '/feed/import-export',
  },
];

const FeedNavBar = () => {
  const pathname = usePathname();

  return (
    <CardNavBar title="Feeds" routes={routes} activePath={pathname}>
      <ToggleMaximize />
    </CardNavBar>
  );
};

export default FeedNavBar;
