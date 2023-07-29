import React from "react";

import type { SpinnerProps } from "tamagui";
import { Spinner, Stack } from "tamagui";

import { Center } from "./Center";

export interface LoadingProps extends React.ComponentProps<typeof Stack> {
  isLoading: boolean
  spinnerSize?: SpinnerProps["size"]
}

export const Loading: React.FC<LoadingProps> = (props) => {
  const { isLoading, spinnerSize = "small", children, ...stackRestProps } = props;
  return (
    <Stack {...stackRestProps}>
      {children}
      {isLoading && (
        <Center position="absolute" width="100%" height="100%">
          <Spinner size={spinnerSize} />
        </Center>
      )}
    </Stack>
  );
};
