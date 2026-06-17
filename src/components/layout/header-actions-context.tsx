"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderActionsContextType = {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
};

const HeaderActionsContext = createContext<HeaderActionsContextType>({
  actions: null,
  setActions: () => {},
});

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);
  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  return useContext(HeaderActionsContext);
}
