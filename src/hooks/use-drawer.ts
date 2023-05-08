import { useContext } from "react";

import { DrawerContext } from "@/context/drawer-context";

export const useDrawer = () => {
  return useContext(DrawerContext);
};
