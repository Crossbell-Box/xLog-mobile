import React from "react";

import { NotificationContext } from "@/context/notification-context";
import { useNotificationSetup } from "@/hooks/use-notification-setup";

interface NotificationProviderProps extends React.PropsWithChildren {

}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { expoPushToken, notification, requestPermissions } = useNotificationSetup();

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, requestPermissions }}>
      {children}
    </NotificationContext.Provider>
  );
}
