import "./online-manager-polyfill";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as storage from "./storage";
import { Platform } from "react-native";


import * as Device from "expo-device";
import Constants from "expo-constants";

const getBaseURL = () => {
  if (Platform.OS === "web") return "http://localhost:3000";

  // Android Emulator
  if (!Device.isDevice && Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  // Physical Android device:
  // If running over Wi-Fi, dynamically resolve the computer's LAN IP from Expo bundler
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:3000`;
    }
  }

  // Fallback for USB debugging with `adb reverse tcp:3000 tcp:3000`
  return "http://localhost:3000";
};

export const baseURL = getBaseURL();

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
