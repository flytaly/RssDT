import { useEffect, useState } from 'react';
import { isServer } from '../../utils/is-server';

export type ItemViewId = 'full' | 'medium' | 'collapsed';
export const ItemViews: Record<ItemViewId, string> = {
  collapsed: 'Collapsed',
  medium: 'Default',
  full: 'Full length',
};

export type ReaderOptions = {
  fontSize: 0 | 1 | 2 | 3 | 4;
  itemView: ItemViewId;
};

export const defaultOptions: ReaderOptions = {
  fontSize: 1,
  itemView: 'medium',
};

const storageKey = 'READER_OPTIONS';

export const useLocalState = () => {
  const [state, setState] = useState<ReaderOptions>(() => {
    if (isServer()) return defaultOptions;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return defaultOptions;
    try {
      const parsed = JSON.parse(saved) as Partial<ReaderOptions>;
      return { ...defaultOptions, ...parsed };
    } catch {
      return defaultOptions;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return [state, setState];
};
