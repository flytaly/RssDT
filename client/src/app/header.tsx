'use client';

import '@/styles/globals.css';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

import { getGQLClient } from '@/app/lib/gqlClient.client';
import NavBar from '@/components/layout/nav-bar';
import Spinner from '@/components/spinner';

const Header = () => {
  const { data, isLoading, isSuccess } = useQuery(['me'], async () => getGQLClient().me(), {
    retry: false,
  });
  let isLoggedIn = isSuccess && !!data?.me;

  return (
    <header className="flex justify-between items-center bg-primary-light rounded-lg py-0.5 px-2 mb-3 gap-12">
      <Link href="/" className="inline-flex">
        <div>
          <Image src="/static/icon-black.png" width={25} height={25} alt="logo" />
        </div>
        <h1 className="inline-block font-bold ml-1 text-lg">FeedMailu</h1>
      </Link>
      {isLoading ? <Spinner /> : <NavBar isLoggedIn={isLoggedIn} />}
    </header>
  );
};

export default Header;
