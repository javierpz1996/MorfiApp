import "../global.css";

import { FontProvider } from "@/components/font-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { DeliveryLocationProvider } from "@/contexts/delivery-location-context";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
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
