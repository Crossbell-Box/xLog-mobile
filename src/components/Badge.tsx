import type { FC, PropsWithChildren } from "react";

import { Circle, Stack } from "tamagui";

export const Badge: FC<PropsWithChildren<{
  size: number
  visible?: boolean
}>> = ({ children, size = 5, visible = true }) => {
  return (
    <Stack>
      {visible && <Circle size={size} backgroundColor={"$primary"} position="absolute" right={-size} top={-size}/>}
      {children}
    </Stack>
  );
};
