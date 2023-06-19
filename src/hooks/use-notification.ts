import { useContext } from "react";

import { NotificationContext } from "@/context/notification-context";

export const useNotification = () => {
  return useContext(NotificationContext);
};
