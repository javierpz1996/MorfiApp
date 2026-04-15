/**
 * Karla: URLs (repo Google Fonts).
 * Rubik: archivos locales en assets/fonts/ (copiá los .ttf que bajaste).
 */
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, type ReactNode } from "react";
import { View } from "react-native";

void SplashScreen.preventAutoHideAsync();

const GF = "https://raw.githubusercontent.com/google/fonts/main/ofl";

/** Rutas relativas al componente → `assets/fonts/` en la raíz del proyecto. */
const customFonts = {
  Karla_400Regular: `${GF}/karla/static/Karla-Regular.ttf`,
  Karla_500Medium: `${GF}/karla/static/Karla-Medium.ttf`,
  Karla_600SemiBold: `${GF}/karla/static/Karla-SemiBold.ttf`,
  Karla_700Bold: `${GF}/karla/static/Karla-Bold.ttf`,

  Rubik_300Light: require("../assets/fonts/Rubik-Light.ttf"),
  Rubik_400Regular: require("../assets/fonts/Rubik-Regular.ttf"),
  Rubik_500Medium: require("../assets/fonts/Rubik-Medium.ttf"),
  Rubik_600SemiBold: require("../assets/fonts/Rubik-SemiBold.ttf"),
  Rubik_700Bold: require("../assets/fonts/Rubik-Bold.ttf"),
  Rubik_800ExtraBold: require("../assets/fonts/Rubik-ExtraBold.ttf"),
  Rubik_900Black: require("../assets/fonts/Rubik-Black.ttf"),
  Rubik_300Light_Italic: require("../assets/fonts/Rubik-LightItalic.ttf"),
  Rubik_400Regular_Italic: require("../assets/fonts/Rubik-Italic.ttf"),
  Rubik_500Medium_Italic: require("../assets/fonts/Rubik-MediumItalic.ttf"),
  Rubik_600SemiBold_Italic: require("../assets/fonts/Rubik-SemiBoldItalic.ttf"),
  Rubik_700Bold_Italic: require("../assets/fonts/Rubik-BoldItalic.ttf"),
  Rubik_800ExtraBold_Italic: require("../assets/fonts/Rubik-ExtraBoldItalic.ttf"),
  Rubik_900Black_Italic: require("../assets/fonts/Rubik-BlackItalic.ttf"),
};

export function FontProvider({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts(customFonts);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <View className="flex-1 font-sans">{children}</View>;
}
