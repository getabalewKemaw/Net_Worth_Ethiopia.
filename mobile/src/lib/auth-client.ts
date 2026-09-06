import "./online-manager-polyfill";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as storage from "./storage";
import { Platform } from "react-native";
import * as Device from "expo-device";

// Physical Android devices connected via USB debugging with `adb reverse tcp:3000 tcp:3000`
// connect directly to http://localhost:3000, matching the Google OAuth callback and cookie domain.
// Android Emulators use http://10.0.2.2:3000.
export const baseURL =
  Platform.OS === "android"
    ? Device.isDevice
      ? "http://localhost:3000"
      : "http://10.0.2.2:3000"
    : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "networth",
      storagePrefix: "networth",
      storage: storage as any,
    }),
  ],
});
