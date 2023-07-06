import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { GA } from "@/utils/GA";

import { useRootNavigation } from "./use-navigation";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationNavigateActionTypes {
  route: "Notifications"
  params: {}
}

type NotificationActionTypes = ({
  type: "navigate"
} & NotificationNavigateActionTypes);

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
  const navigation = useRootNavigation();

  const navigateAction = useCallback(async (data: NotificationNavigateActionTypes) => {
    const { route, params } = data;

    switch (route) {
      case "Notifications":
        // TODO: Set this notification as read
        // ...

        // TODO: Update badge count
        // await recomputedBadgeCount(notification.request.content.badge);

        // Navigate to PostDetails
        navigation.navigate("Home", {
          screen: "Notifications",
        });
        break;
    }
  }, []);

  const performAction = useCallback(async (data: NotificationActionTypes) => {
    switch (data.type) {
      case "navigate":
        await navigateAction(data);
        break;
    }
  }, []);

  const recomputedBadgeCount = useCallback(async (badgeCount: number) => {
    const totalBadgeCount = await Notifications.getBadgeCountAsync();
    // TODO
    const removeBadgeResponse = await Notifications.setBadgeCountAsync(0);
  }, []);

  const clearBadgeCount = useCallback(() => Notifications.setBadgeCountAsync(0), []);

  useEffect(() => {
    requestPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      // eslint-disable-next-line no-console
      console.log("AddNotificationResponseReceivedListener:", JSON.stringify(response, null, 4));

      const { notification } = response;
      await Notifications.dismissNotificationAsync(notification.request.identifier);

      const notificationActions = (notification.request.content.data || {}) as NotificationActionTypes;

      GA.logEvent("open_app", {
        type: "notification",
        data: notificationActions,
      });

      performAction(notificationActions);
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
    clearBadgeCount,
  };
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    return;
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

