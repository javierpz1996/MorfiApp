import { useDeliveryLocation } from "@/contexts/delivery-location-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UbicacionesScreen() {
  const { manualLocation } = useDeliveryLocation();

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
          Ubicaciones
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
        <Text className="mb-4 text-base leading-6 text-neutral-600">
          Gestioná el punto de entrega o recogida que usamos en el inicio.
        </Text>
        {manualLocation ? (
          <View className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <Text className="mb-1 text-xs font-semibold uppercase text-neutral-500">
              Ubicación elegida
            </Text>
            <Text className="text-base font-semibold text-neutral-900">
              {manualLocation.label}
            </Text>
          </View>
        ) : (
          <Text className="mb-6 text-base text-neutral-600">
            Estás usando la ubicación por GPS desde el inicio. Podés fijar una
            dirección en el mapa.
          </Text>
        )}
        <Pressable
          className="items-center rounded-xl bg-orange-600 py-4 active:opacity-90"
          onPress={() => router.push("/map?pick=1" as never)}
        >
          <Text className="text-center text-base font-semibold text-white">
            Elegir en el mapa
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
