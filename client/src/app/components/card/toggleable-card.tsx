'use client';

import { createContext, useCallback, useState } from 'react';

import BigCard from './big-card';

interface CardProps {
  children: React.ReactNode;
  verificationWarning?: boolean;
  stretch?: boolean;
}

type CardState = { fullWidth: boolean };
export const WidthToggleCtx = createContext(() => {});

export default function ToggleableCard({ children, verificationWarning = false }: CardProps) {
  const [state, setState] = useState<CardState>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stretch = urlParams.get('stretch');
    return { fullWidth: stretch === 'true' };
  });

  const toggleWidth = useCallback(() => {
    setState((current) => {
      if (!current.fullWidth) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.append('stretch', 'true');
        window.location.search = urlParams.toString();
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('stretch');
        window.location.search = urlParams.toString();
      }
      return { ...current, fullWidth: !current.fullWidth };
    });
  }, []);

  return (
    <WidthToggleCtx.Provider value={toggleWidth}>
      <BigCard verificationWarning={verificationWarning} stretch={state.fullWidth}>
        {children}
      </BigCard>
    </WidthToggleCtx.Provider>
  );
}
