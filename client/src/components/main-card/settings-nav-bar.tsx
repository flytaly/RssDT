import { useRouter } from 'next/dist/client/router';
import React from 'react';
import CardNavBar, { CardRoute } from './card-nav-bar';

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
  const route = useRouter();
  return <CardNavBar title="Profile" routes={routes} activePath={route.pathname} />;
};

export default SettingsNavBar;
