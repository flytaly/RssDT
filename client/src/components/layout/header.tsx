import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import NavBar from './nav-bar';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center bg-primary-light rounded-lg py-0.5 px-2 mb-3">
      <Link href="/" className="inline-flex">
        <Image src="/static/icon-black.png" width={25} height={25} alt="logo" />
        <h1 className="inline-block font-bold ml-1 text-lg">FeedMailu</h1>
      </Link>
      <NavBar />
    </header>
  );
};

export default Header;
