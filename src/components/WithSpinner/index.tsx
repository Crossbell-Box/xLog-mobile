import type { FC } from "react";
import { StyleSheet } from "react-native";

import type { YStackProps } from "tamagui";
import { Spinner, Stack } from "tamagui";

import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

export const WithSpinner: FC<{ isLoading: boolean } & YStackProps> = ({ children, isLoading, ...restProps }) => {
  return (
    <Stack position="relative" style={StyleSheet.absoluteFill} {...restProps}>
      {children}
      {
        isLoading && (
          <ModalWithFadeAnimation isVisible>
            <Stack
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <Spinner/>
            </Stack>
          </ModalWithFadeAnimation>
        )
      }
    </Stack>
  );
};
