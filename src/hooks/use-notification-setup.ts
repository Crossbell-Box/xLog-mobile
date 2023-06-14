import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function useNotificationSetup() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      await Notifications.dismissNotificationAsync(response.notification.request.identifier);
      const totalBadgeCount = await Notifications.getBadgeCountAsync();
      const badgeCount = response.notification.request.content.badge;
      const removeBadgeResponse = await Notifications.setBadgeCountAsync(Math.max(totalBadgeCount - badgeCount, 0));
      // eslint-disable-next-line no-console
      console.log("AddNotificationResponseReceivedListener:", JSON.stringify(response, null, 4));
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // eslint-disable-next-line no-console
  console.log("ExpoPushToken:", expoPushToken);

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }
  else {
    console.warn("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

