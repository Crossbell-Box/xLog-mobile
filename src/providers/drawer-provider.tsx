import React, { useState } from "react";

import { DrawerContext } from "@/context/drawer-context";

interface DrawerProviderProps extends React.PropsWithChildren {

}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, isDrawerOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}
