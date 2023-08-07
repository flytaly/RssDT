import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';

type AppState = { fullWidth: boolean };

const initialState: AppState = { fullWidth: false };

export const AppStateCtx = createContext<AppState>(initialState);
export const AppStateDispatchCtx = createContext<Dispatch<SetStateAction<AppState>>>(() => {});

const StateStorageKey = 'app-state';
export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const prevState = window.localStorage.getItem(StateStorageKey);
        if (prevState) {
          const parsed = JSON.parse(prevState);
          setState((current) => ({ ...current, ...parsed }));
        }
      } catch (e) {
        console.error("Couldn't load state\n", e);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(StateStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <AppStateDispatchCtx.Provider value={setState}>
      <AppStateCtx.Provider value={state}>{children}</AppStateCtx.Provider>
    </AppStateDispatchCtx.Provider>
  );
};
