'use client';

import { useContext } from 'react';

import { AppStateCtx } from '@/app/feed/app-state';
import MaximizeIcon from '@/assets/maximize.svg';

export default function ToggleMaximize() {
  const { setState } = useContext(AppStateCtx);
  return (
    <button
      type="button"
      onClick={() => {
        setState((s) => {
          const newWidth = s.cardWidth !== 'stretch' ? 'stretch' : '';
          document.cookie = `width=${newWidth}`;
          return { ...s, cardWidth: newWidth };
        });
      }}
      title="Toggle width"
      className="icon-btn text-gray-700 hover:text-primary"
    >
      <MaximizeIcon className="w-5" />
    </button>
  );
}
