import { usePathname } from 'next/navigation';
import React from 'react';

import CardNavBar, { CardRoute } from './nav-bar';

const routes: CardRoute[] = [
  {
    name: 'Information',
    path: '/settings/#info',
  },
  {
    name: 'Digest settings',
    path: '/settings/#digest',
  },
  {
    name: 'Actions',
    path: '/settings/#actions',
  },
];

const SettingsNavBar = () => {
  const pathname = usePathname();
  return <CardNavBar title="Profile" routes={routes} activePath={pathname} />;
};

export default SettingsNavBar;
