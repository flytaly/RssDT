import React from 'react';
import Link from 'next/link';

const PrimaryLink: React.FC<{ href: string }> = ({ href, children }) => (
  <Link href={href}>
    <a className="inline underline text-primary">{children}</a>
  </Link>
);

export default PrimaryLink;
