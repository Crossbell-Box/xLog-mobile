import type { SwitchProps } from "tamagui";
import { Switch as TamaguiSwitch } from "tamagui";

export const Switch = (props: SwitchProps) => {
  return (
    <TamaguiSwitch {...props} size="$3" backgroundColor={"$background"}>
      <TamaguiSwitch.Thumb animation="bouncy" backgroundColor={"$primary"} opacity={props.checked ? 1 : 0.3}/>
    </TamaguiSwitch>
  );
};
