'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useMeQuery } from '@/generated/graphql';

import NavBar from './nav-bar';
import Spinner from '../spinner';

const Header = () => {
  const { data, loading } = useMeQuery({ ssr: false });
  return (
    <header className="flex justify-between items-center bg-primary-light rounded-lg py-0.5 px-2 mb-3">
      <Link href="/" className="inline-flex">
        <Image src="/static/icon-black.png" width={25} height={25} alt="logo" />
        <h1 className="inline-block font-bold ml-1 text-lg">FeedMailu</h1>
      </Link>
      {loading ? <Spinner /> : <NavBar isLoggedIn={!!data?.me} />}
    </header>
  );
};

export default Header;
