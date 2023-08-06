import Link from 'next/link';
import React, { useContext } from 'react';
import MaximizeIcon from '../../../public/static/maximize.svg';

import { AppStateDispatchCtx } from '../app-context';

export type CardRoute = {
  name: string;
  path: string;
};

const CardNavBar: React.FC<{ title: string; routes: CardRoute[]; activePath: string }> = ({
  routes,
  title,
  activePath,
}) => {
  const dispatch = useContext(AppStateDispatchCtx);
  const toggleWidth = () => dispatch((prev) => ({ ...prev, fullWidth: !prev.fullWidth }));
  return (
    <header className="flex justify-between items-start border-b border-gray pt-1 pb-2 pl-4 pr-2">
      <div>
        <div className="text-lg text-primary-dark font-bold">{title}</div>
        <nav className="flex text-sm space-x-4">
          {routes.map((r) => (
            <Link
              key={r.path}
              href={r.path}
              className={`hover-underline-link ${r.path === activePath ? 'active' : ''}`}
            >
              {r.name}
            </Link>
          ))}
        </nav>
      </div>
      <button
        type="button"
        onClick={toggleWidth}
        title="Toggle width"
        className="icon-btn text-gray-700 hover:text-primary"
      >
        <MaximizeIcon className="w-5" />
      </button>
    </header>
  );
};

export default CardNavBar;
