import { Dispatch, SetStateAction, createContext, useState } from 'react';

export type CardWidthState = 'stretch' | '' | null | undefined;
export type AppState = { cardWidth: CardWidthState };

export const AppStateCtx = createContext<{
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
}>({
  state: { cardWidth: '' },
  setState: () => {},
});

export function AppStateProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: AppState;
}) {
  const [state, setState] = useState<AppState>(initial);
  const appState = { state, setState };
  return <AppStateCtx.Provider value={appState}>{children}</AppStateCtx.Provider>;
}
