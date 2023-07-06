import React from "react";

import { useNetInfo } from "@react-native-community/netinfo";

interface Props {
  ifConnected?: React.ReactNode
  ifReachable?: React.ReactNode
  ifNotConnected?: React.ReactNode
  ifNotReachable?: React.ReactNode
}

export const NetworkSafeView: React.FC<Props> = (props) => {
  const { ifConnected, ifReachable, ifNotConnected, ifNotReachable } = props;
  const { isConnected, isInternetReachable } = useNetInfo();

  return (
    <>
      {isConnected && ifConnected}
      {isInternetReachable && ifReachable}
      {!isConnected && ifNotConnected}
      {!isInternetReachable && ifNotReachable}
    </>
  );
};
