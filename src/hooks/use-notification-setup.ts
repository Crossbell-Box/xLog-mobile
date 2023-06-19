import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationError extends Error {
  constructor(message: string, status: Notifications.PermissionStatus) {
    super(message);
    this.name = "NotificationError";
  }

  status: Notifications.PermissionStatus;
}

export function useNotificationSetup() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    requestPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      await Notifications.dismissNotificationAsync(response.notification.request.identifier);
      const totalBadgeCount = await Notifications.getBadgeCountAsync();
      const badgeCount = response.notification.request.content.badge;
      // TODO
      const removeBadgeResponse = await Notifications.setBadgeCountAsync(Math.max(totalBadgeCount - badgeCount, 0));
      // eslint-disable-next-line no-console
      console.log("AddNotificationResponseReceivedListener:", JSON.stringify(response, null, 4));
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const requestPermissions = () => {
    return registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      return token;
    });
  };

  // eslint-disable-next-line no-console
  console.log("ExpoPushToken:", expoPushToken);

  return {
    expoPushToken,
    notification,
    requestPermissions,
  };
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    throw new Error("Must use physical device for Push Notifications.");
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus: Notifications.PermissionStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new NotificationError("Failed to get push token for push notification!", finalStatus);
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

