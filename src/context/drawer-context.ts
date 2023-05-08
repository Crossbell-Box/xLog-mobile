import { createContext } from "react";

interface DrawerContextType {
  openDrawer: () => void
  closeDrawer: () => void
  isDrawerOpen: boolean
}

export const DrawerContext = createContext<DrawerContextType | null>(null);
