import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { authClient } from "@/lib/auth-client";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { registerDeviceToken } from "@/service/notification.service";

export function usePushNotifications() {
  const { data: session } = authClient.useSession();
  const registered = useRef(false);

  useEffect(() => {
    if (!session || registered.current) return;

    let cancelled = false;

    (async () => {
      try {
        if (Platform.OS !== "ios" && Platform.OS !== "android") return;

        const token = await registerForPushNotificationsAsync();
        if (!token || cancelled) return;

        const platform = Platform.OS;
        await registerDeviceToken({ token, platform });

        if (!cancelled) {
          registered.current = true;
          console.log("[push] token registered successfully");
        }
      } catch (err) {
        console.error("[push] registration failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          route?: string;
        };
        console.log("[push] tapped:", data);
      }
    );

    return () => sub.remove();
  }, []);
}
