'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import CardNavBar, { CardRoute } from './card-nav-bar';

const routes: CardRoute[] = [
  { name: 'Help', path: '/help' },
  { name: 'Contacts', path: '/contacts' },
];

const InfoNavBar = () => {
  const pathname = usePathname();
  return <CardNavBar title="Information" routes={routes} activePath={pathname} />;
};

export default InfoNavBar;
