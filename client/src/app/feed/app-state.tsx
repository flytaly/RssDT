import { Dispatch, SetStateAction, createContext } from 'react';

export type CardWidthState = 'stretch' | '' | null | undefined;
export type AppState = { cardWidth: CardWidthState };

export const AppStateCtx = createContext<{
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
}>({
  state: { cardWidth: '' },
  setState: () => {},
});
