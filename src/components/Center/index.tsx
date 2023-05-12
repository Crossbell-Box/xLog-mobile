import React from "react";

import { Stack } from "tamagui";

export interface CenterProps extends React.ComponentProps<typeof Stack> {

}

export const Center: React.FC<CenterProps> = (props) => {
  return (
    <Stack justifyContent="center" alignItems="center" {...props} />
  );
};
