import { ToastProvider as _ToastProvider } from "@tamagui/toast";

export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <_ToastProvider native>
      {children}
    </_ToastProvider>
  );
};
