import { useAuth } from "@/contexts/auth-context";
import { setLocationOnboardingComplete } from "@/lib/location-onboarding";
import * as Location from "expo-location";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingLocation() {
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const userId = session.user.id;

  const handleUseLocation = async () => {
    setBusy(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso de ubicación",
          "Podés activarlo más tarde en los ajustes del dispositivo. Seguimos adelante.",
        );
      } else {
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "No se pudo obtener la ubicación.";
      Alert.alert("Ubicación", msg);
    } finally {
      await setLocationOnboardingComplete(userId);
      router.replace("/(tabs)" as never);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center">
        <Text className="mb-4 text-center text-2xl font-bold text-neutral-900">
          ¿En qué zona querés rescatar?
        </Text>
        <Text className="mb-10 text-center text-base leading-6 text-neutral-600">
          Compartí tu ubicación para explorar tiendas cercanas y paquetes
          disponibles
        </Text>

        <Pressable
          className={
            busy
              ? "items-center rounded-xl bg-orange-300 py-4"
              : "items-center rounded-xl bg-orange-600 py-4 active:opacity-90"
          }
          disabled={busy}
          onPress={handleUseLocation}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-base font-semibold text-white">
              Usar mi ubicación actual
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
