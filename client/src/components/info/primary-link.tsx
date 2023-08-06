import React from 'react';
import Link from 'next/link';

const PrimaryLink: React.FC<{ href: string }> = ({ href, children }) => (
  <Link href={href} className="inline underline text-primary">
    {children}
  </Link>
);

export default PrimaryLink;
