import { createContext } from "react";

interface GlobalContextType {
  token: string
  setToken: (token: string) => void
}

export const GlobalContext = createContext<GlobalContextType | null>(null);
