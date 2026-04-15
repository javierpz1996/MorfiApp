import { useAuth } from "@/contexts/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilScreen() {
  const { session } = useAuth();
  const email = session?.user?.email;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center border-b border-neutral-100 px-2 py-2">
        <Pressable
          accessibilityLabel="Volver"
          className="h-10 w-10 items-center justify-center active:opacity-60"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>
        <Text className="min-w-0 flex-1 text-center text-lg font-bold text-neutral-900">
          Perfil
        </Text>
        <Pressable
          accessibilityLabel="Cerrar"
          className="h-10 w-10 items-center justify-center active:opacity-60"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#171717" />
        </Pressable>
      </View>
      <View className="px-4 pt-6">
        <Text className="mb-2 text-base text-neutral-600">
          Acá vas a poder editar tu nombre, foto y preferencias.
        </Text>
        {email ? (
          <Text className="text-base font-medium text-neutral-900">{email}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
