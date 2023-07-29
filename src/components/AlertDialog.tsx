import type { FC, PropsWithChildren } from "react";
import { useImperativeHandle, forwardRef, useState, useMemo, useCallback, useEffect } from "react";
import type { ViewStyle } from "react-native";

import { Button, AlertDialog as TAlertDialog, XStack, YStack, Stack } from "tamagui";

import { useKeyboardStatus } from "@/utils/useKeyboardStatus";

import { KeyboardAvoidingView } from "./KeyboardAvoidingView";

interface CallBackParams {
  toggle: (visible?: boolean) => void
  open: () => void
  close: () => void
}

interface Props extends PropsWithChildren {
  title: string
  description: React.ReactNode
  visible?: boolean
  confirmText?: string
  cancelText?: string
  renderConfirm?: (props: CallBackParams) => JSX.Element
  renderCancel?: (props: CallBackParams) => JSX.Element
  onConfirm?: (props: CallBackParams) => void
  onCancel?: (props: CallBackParams) => void
  containerStyle?: ViewStyle
}

export interface AlertDialogInstance extends CallBackParams {

}

export const AlertDialog: FC<Props> = ({
  children,
  title,
  visible,
  description,
  confirmText,
  cancelText,
  renderCancel,
  renderConfirm,
  containerStyle,
  onConfirm: _onConfirm,
  onCancel: _onCancel,
}) => {
  const [_visible, setVisible] = useState(false);
  const { isKeyboardVisible } = useKeyboardStatus();
  const toggle = useCallback((visible?: boolean) => { setVisible(typeof visible === "undefined" ? !_visible : visible); }, [_visible]);
  const open = useCallback(() => { toggle(true); }, [toggle]);
  const close = useCallback(() => { toggle(false); }, [toggle]);
  const params = useMemo(() => ({ toggle, open, close }), [toggle]);
  const onConfirm = () => { _onConfirm?.(params); };
  const onCancel = () => { _onCancel?.(params); };

  useEffect(() => {
    if (typeof visible === "boolean") {
      setVisible(visible);
    }
  }, [visible]);

  return (
    <TAlertDialog open={_visible}>
      {children && (
        <TAlertDialog.Trigger asChild>
          {children}
        </TAlertDialog.Trigger>
      )}

      <TAlertDialog.Portal>
        <TAlertDialog.Overlay
          key="overlay"
          animation="quick"
          backgroundColor={"$backgroundTransparent"}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <TAlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          width="90%"
          maxWidth={400}
          y={isKeyboardVisible ? -100 : 0}
          style={containerStyle}
        >
          <YStack space>
            {title && <TAlertDialog.Title size={"$7"}>{title}</TAlertDialog.Title>}
            {
              typeof description === "string"
                ? (
                  <TAlertDialog.Description>
                    {description}
                  </TAlertDialog.Description>
                )
                : description
            }

            <XStack space="$3" justifyContent="flex-end">
              <TAlertDialog.Cancel asChild>
                {
                  renderCancel ? renderCancel(params) : <Button onPress={onCancel}>{cancelText}</Button>
                }
              </TAlertDialog.Cancel>
              <TAlertDialog.Action asChild>
                {
                  renderConfirm ? renderConfirm(params) : <Button onPress={onConfirm}>{confirmText}</Button>
                }
              </TAlertDialog.Action>
            </XStack>
          </YStack>
        </TAlertDialog.Content>
      </TAlertDialog.Portal>
    </TAlertDialog>
  );
};
