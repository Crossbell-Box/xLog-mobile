import type React from "react";

import { useNetworkChecker } from "@/hooks/use-network-checker";

interface Props {}

export const NetworkChecker: React.FC<Props> = (props) => {
  useNetworkChecker();
  return null;
};
