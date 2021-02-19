import { useRouter } from 'next/dist/client/router';
import React from 'react';
import CardNavBar, { CardRoute } from './card-nav-bar';

const routes: CardRoute[] = [
  { name: 'Help', path: '/help' },
  { name: 'Contacts', path: '/contacts' },
];

const InfoNavBar = () => {
  const route = useRouter();
  return <CardNavBar title="Information" routes={routes} activePath={route.pathname} />;
};

export default InfoNavBar;
