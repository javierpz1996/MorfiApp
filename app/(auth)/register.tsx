import { router } from "expo-router";
import { useEffect } from "react";
import {
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  useEffect(() => {
    router.replace("/(auth)/register-email" as never);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="p-6 text-neutral-900">Cargando…</Text>
    </SafeAreaView>
  );
}
