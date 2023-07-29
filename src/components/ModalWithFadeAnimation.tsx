import type { FC } from "react";
import type { ModalProps } from "react-native-modal";
import _Modal from "react-native-modal";

export const ModalWithFadeAnimation: FC<Partial<ModalProps> & Required<Pick<ModalProps, "isVisible">>> = (props) => {
  return (
    <_Modal
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      animationInTiming={250}
      animationOutTiming={250}
      backdropTransitionOutTiming={0}
      {...props as ModalProps}
    />
  );
};
