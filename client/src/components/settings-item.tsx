import React from 'react';

import Spinner from './spinner';

interface ItemProps {
  title: React.ReactNode;
  error?: string;
  saving?: boolean;
  children: React.ReactNode;
}

export default function Item({ children, title, error, saving }: ItemProps) {
  return (
    <article className="relative my-2 py-2 border-b border-gray-300">
      <h3 className="font-semibold mb-1">{title}</h3>
      <div className="font-light text-sm">{children}</div>
      {error ? <div className="font-light text-sm mb-1 text-error">{error}</div> : null}
      {saving ? (
        <div className="absolute right-1 top-2">
          <Spinner />
        </div>
      ) : null}
    </article>
  );
}
