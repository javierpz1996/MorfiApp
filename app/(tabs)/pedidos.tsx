import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PedidosTab() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-xl font-bold text-neutral-900">
          Pedidos
        </Text>
        <Text className="mt-2 text-center text-base text-neutral-600">
          Acá verás el historial y el estado de tus pedidos.
        </Text>
      </View>
    </SafeAreaView>
  );
}
