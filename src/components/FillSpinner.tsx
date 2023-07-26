import type { FC } from "react";

import type { StackProps } from "tamagui";
import { Spinner } from "tamagui";

import { Center } from "./Center";

export const FillSpinner: FC<StackProps> = (props) => {
  return (
    <Center flex={1} {...props}>
      <Spinner />
    </Center>
  );
};
