import { useEffect, useState } from 'react';
import { isServer } from '../../utils/is-server';

export type ReaderOptions = {
  fontSize: 0 | 1 | 2 | 3 | 4;
};

export const defaultOptions: ReaderOptions = {
  fontSize: 1,
};

const storageKey = 'READER_OPTIONS';

export const useLocalState = () => {
  const [state, setState] = useState(() => {
    if (isServer()) return defaultOptions;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return defaultOptions;
    try {
      return JSON.parse(saved) as ReaderOptions;
    } catch {
      return defaultOptions;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return [state, setState];
};
