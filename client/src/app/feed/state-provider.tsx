'use client';

import { useState } from 'react';

import BigCard from '@/components/card/big-card';
import { useRedirectUnauthorized } from '@/hooks/use-redirect-auth';

import { AppStateCtx, type AppState } from './app-state';

export default function AppStateProvider({
  children,
  initialState,
}: {
  initialState: AppState;
  children: React.ReactNode;
}) {
  const me = useRedirectUnauthorized();
  const showWarning = !me.isLoading && !me.me?.emailVerified;

  const [state, setState] = useState<AppState>(initialState);
  const appState = { state, setState };

  return (
    <AppStateCtx.Provider value={appState}>
      <BigCard verificationWarning={showWarning} stretch={state.cardWidth === 'stretch'}>
        {children}
      </BigCard>
    </AppStateCtx.Provider>
  );
}
