'use client';

import { useContext } from 'react';

import MaximizeIcon from '@/../public/static/maximize.svg';
import { WidthToggleCtx } from '@/app/components/card/toggleable-card';

export default function ToggleMaximize() {
  const toggleWidth = useContext(WidthToggleCtx);
  return (
    <button
      type="button"
      onClick={toggleWidth}
      title="Toggle width"
      className="icon-btn text-gray-700 hover:text-primary"
    >
      <MaximizeIcon className="w-5" />
    </button>
  );
}
