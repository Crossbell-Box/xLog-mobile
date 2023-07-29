import { forwardRef, type ComponentPropsWithRef, ForwardedRef, useMemo } from "react";

import type { TamaguiElement } from "tamagui";
import { Button as _Button } from "tamagui";

type ButtonProps = ComponentPropsWithRef<typeof _Button>;

interface Props extends ButtonProps {
  type?: "primary" | "normal" | "disabled"

}

export const Button = forwardRef<TamaguiElement, Props>((props, ref) => {
  const { type = "normal", disabled: _disabled, ...restProps } = props;

  const backgroundColor = useMemo<ButtonProps["backgroundColor"]>(() => {
    switch (type) {
      case "primary":
        return "$primary";
      case "disabled":
      default:
        return restProps.backgroundColor;
    }
  }, [type, restProps.backgroundColor]);

  const color = useMemo<ButtonProps["color"]>(() => {
    switch (type) {
      case "primary":
        return "$color";
      case "disabled":
      default:
        return restProps.color;
    }
  }, [type, restProps.color]);

  const disabled = useMemo<ButtonProps["disabled"]>(() => {
    switch (type) {
      case "disabled":
        return true;
      default:
        return _disabled;
    }
  }, [type, _disabled]);

  return <_Button ref={ref} disabled={disabled} {...restProps} backgroundColor={backgroundColor} color={color}/>;
});
