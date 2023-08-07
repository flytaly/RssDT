import Link from 'next/link';
import React from 'react';

const PrimaryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="inline underline text-primary">
    {children}
  </Link>
);

export default PrimaryLink;
