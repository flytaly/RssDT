import { useRouter } from 'next/dist/client/router';
import React from 'react';
import CardNavBar, { CardRoute } from './card-nav-bar';

const routes: CardRoute[] = [
  {
    name: 'View',
    path: '/feeds/reader',
  },
  {
    name: 'Manage digests',
    path: '/feeds/manage',
  },
];

const FeedNavBar = () => {
  const route = useRouter();
  return <CardNavBar title="Feeds" routes={routes} activePath={route.pathname} />;
};

export default FeedNavBar;
