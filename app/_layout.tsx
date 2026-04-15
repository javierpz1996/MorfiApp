import "../global.css";

import { FontProvider } from "@/components/font-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { DeliveryLocationProvider } from "@/contexts/delivery-location-context";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync("light").catch(() => {});
    // With edge-to-edge, use style API (3-button nav only).
    NavigationBar.setStyle("dark");
  }, []);

  return (
    <FontProvider>
      <AuthProvider>
        <DeliveryLocationProvider>
          <>
            <Slot />
            <StatusBar style="auto" />
          </>
        </DeliveryLocationProvider>
      </AuthProvider>
    </FontProvider>
  );
}
