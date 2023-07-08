import type { PropsWithChildren } from "react";
import { useImperativeHandle, forwardRef, useState } from "react";
import type { ViewStyle } from "react-native";

import { Button, AlertDialog as TAlertDialog, XStack, YStack, Stack } from "tamagui";

interface CallBackParams {
  toggle: (visible?: boolean) => void
}

interface Props extends PropsWithChildren {
  title: string
  description: React.ReactNode
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

export const AlertDialog = forwardRef<AlertDialogInstance, Props>(({
  children,
  title,
  description,
  confirmText,
  cancelText,
  renderCancel,
  renderConfirm,
  containerStyle,
  onConfirm: _onConfirm,
  onCancel: _onCancel,
}, ref) => {
  const [visible, setVisible] = useState(false);

  const toggle = (visible?: boolean) => { setVisible(typeof visible === "undefined" ? !visible : visible); };
  const onConfirm = () => { _onConfirm?.({ toggle }); };
  const onCancel = () => { _onCancel?.({ toggle }); };

  useImperativeHandle(ref, () => ({
    toggle,
  }));

  return (
    <TAlertDialog open={visible}>
      {children && (
        <TAlertDialog.Trigger asChild>
          {children}
        </TAlertDialog.Trigger>
      )}

      <TAlertDialog.Portal>
        <TAlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
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
          y={0}
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
                  renderCancel ? renderCancel({ toggle }) : <Button onPress={onCancel}>{cancelText}</Button>
                }
              </TAlertDialog.Cancel>
              <TAlertDialog.Action asChild>
                {
                  renderConfirm ? renderConfirm({ toggle }) : <Button onPress={onConfirm}>{confirmText}</Button>
                }
              </TAlertDialog.Action>
            </XStack>
          </YStack>
        </TAlertDialog.Content>
      </TAlertDialog.Portal>
    </TAlertDialog>
  );
});
