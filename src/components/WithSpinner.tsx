import type { FC } from "react";
import { StyleSheet } from "react-native";

import type { YStackProps } from "tamagui";
import { Spinner, Stack } from "tamagui";

import { ModalWithFadeAnimation } from "./ModalWithFadeAnimation";

export const FilledSpinner: FC<YStackProps> = (props) => {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      flex={1}
      {...props}
    >
      <Spinner/>
    </Stack>
  );
};

export const WithSpinner: FC<{ isLoading: boolean } & YStackProps> = ({ children, isLoading, ...restProps }) => {
  return (
    <Stack position="relative" style={StyleSheet.absoluteFill} {...restProps}>
      {children}
      {
        isLoading && (
          <ModalWithFadeAnimation isVisible>
            <FilledSpinner/>
          </ModalWithFadeAnimation>
        )
      }
    </Stack>
  );
};
