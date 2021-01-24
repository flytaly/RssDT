import Link from 'next/link';
import React from 'react';

export type CardRoute = {
  name: string;
  path: string;
};

const CardNavBar: React.FC<{ title: string; routes: CardRoute[]; activePath: string }> = ({
  routes,
  title,
  activePath,
}) => {
  return (
    <header className="border-b border-gray pt-1 pb-2 px-4">
      <div className="text-lg text-primary-dark font-bold">{title}</div>
      <nav className="flex text-sm">
        {routes.map((r) => (
          <Link key={r.path} href={r.path}>
            <a className={`mr-3 hover-underline-link ${r.path === activePath ? 'active' : ''}`}>
              {r.name}
            </a>
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default CardNavBar;
