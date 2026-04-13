import { type CheapSharkDeal, fetchDeals } from "@/lib/cheapshark";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Main() {
  const [deals, setDeals] = useState<CheapSharkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchDeals();
        setDeals(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-neutral-600">Cargando ofertas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <Text className="border-b border-neutral-200 bg-white px-4 py-3 text-lg font-bold">
        Ofertas CheapShark ({deals.length})
      </Text>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.dealID}
        contentContainerClassName="pb-8"
        renderItem={({ item }) => (
          <View className="mx-3 mt-3 flex-row overflow-hidden rounded-xl bg-white p-3 shadow-sm">
            <Image
              source={{ uri: item.thumb }}
              className="mr-3 h-[72px] w-[120px] rounded-md bg-neutral-200"
              contentFit="cover"
              transition={200}
            />
            <View className="flex-1 justify-center">
              <Text
                className="font-semibold text-neutral-900"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text className="mt-1 text-sm text-green-600">
                ${item.salePrice}
                <Text className="text-neutral-400 line-through">
                  {" "}
                  ${item.normalPrice}
                </Text>
              </Text>
              <Text className="text-xs text-neutral-500">
                Ahorro ~{Number(item.savings).toFixed(0)}% · tienda{" "}
                {item.storeID}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
