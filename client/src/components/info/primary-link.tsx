import React from 'react';
import Link from 'next/link';

const PrimaryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="inline underline text-primary">
    {children}
  </Link>
);

export default PrimaryLink;
