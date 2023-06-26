import React from "react";

import { NotificationContext } from "@/context/notification-context";
import { useNotificationSetup } from "@/hooks/use-notification-setup";

interface NotificationProviderProps extends React.PropsWithChildren {

}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { expoPushToken, notification, clearBadgeCount, requestPermissions } = useNotificationSetup();

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, clearBadgeCount, requestPermissions }}>
      {children}
    </NotificationContext.Provider>
  );
}
