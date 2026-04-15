import { supabase } from "@/lib/supabase";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDeliveryLocation } from "@/contexts/delivery-location-context";
import { PRODUCT_CATEGORIES, categoryById } from "@/lib/product-categories";
import { formatDistanceKm, haversineKm } from "@/lib/geo";
import { fetchProductsForFeed, type ProductRow } from "@/lib/products";
import { zoneLabelFromGeocode } from "@/lib/zone-label";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeTab() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { manualLocation } = useDeliveryLocation();
  const [zone, setZone] = useState("");
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const closeMenu = () => setMenuOpen(false);

  const signOutAndGoToLogin = async () => {
    closeMenu();
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Cerrar sesión", error.message);
      return;
    }
    try {
      router.dismissAll();
    } catch {
      /* sin stacks extra */
    }
    router.replace("/(auth)/login" as never);
  };

  const refreshZoneFromGps = useCallback(async (signal?: AbortSignal) => {
    setLocationLoading(true);
    try {
      let status = (await Location.getForegroundPermissionsAsync()).status;
      if (signal?.aborted) return;
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (signal?.aborted) return;
      if (status !== "granted") {
        setZone("Activa la ubicación");
        if (!signal?.aborted) setUserCoords(null);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (signal?.aborted) return;
      if (!signal?.aborted) {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (signal?.aborted) return;
      const label = zoneLabelFromGeocode(geo);
      setZone(
        label ||
          `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`,
      );
    } catch {
      if (!signal?.aborted) {
        setZone("Sin ubicación");
        setUserCoords(null);
      }
    } finally {
      if (!signal?.aborted) {
        setLocationLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const ac = new AbortController();
      if (manualLocation) {
        setZone(manualLocation.label);
        setUserCoords({
          latitude: manualLocation.latitude,
          longitude: manualLocation.longitude,
        });
        setLocationLoading(false);
        return () => {
          ac.abort();
        };
      }
      void refreshZoneFromGps(ac.signal);
      return () => {
        ac.abort();
        setLocationLoading(false);
      };
    }, [manualLocation, refreshZoneFromGps]),
  );

  useFocusEffect(
    useCallback(() => {
      const ac = new AbortController();
      void (async () => {
        setProductsLoading(true);
        try {
          const list = await fetchProductsForFeed();
          if (!ac.signal.aborted) setProducts(list);
        } catch {
          if (!ac.signal.aborted) setProducts([]);
        } finally {
          if (!ac.signal.aborted) setProductsLoading(false);
        }
      })();
      return () => {
        ac.abort();
      };
    }, []),
  );

  const openLocationPicker = () => {
    router.push("/map?pick=1" as never);
  };

  const openMenu = () => setMenuOpen(true);

  const goFromMenu = (href: "/perfil" | "/ubicaciones" | "/agregar-producto") => {
    closeMenu();
    router.push(href as never);
  };

  const openNotifications = () => {
    Alert.alert(
      "Notificaciones",
      "Próximamente verás aquí avisos de pedidos, ofertas y rescates.",
    );
  };

  return (
    <SafeAreaView className="relative flex-1 bg-white" edges={["top"]}>
      <Modal
        animationType="slide"
        onRequestClose={closeMenu}
        transparent
        visible={menuOpen}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Cerrar menú"
            className="absolute bottom-0 left-0 right-0 top-0 bg-black/45"
            onPress={closeMenu}
          />
          <View
            className="rounded-t-3xl bg-white px-2 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          >
            <View className="mb-2 flex-row items-center px-2">
              <Text className="min-w-0 flex-1 text-xl font-bold text-neutral-900">
                Menú
              </Text>
              <Pressable
                accessibilityLabel="Cerrar menú"
                className="h-10 w-10 items-center justify-center active:opacity-60"
                hitSlop={8}
                onPress={closeMenu}
              >
                <Ionicons name="close" size={28} color="#171717" />
              </Pressable>
            </View>
            <Pressable
              className="border-b border-neutral-100 py-4 active:bg-neutral-50"
              onPress={() => goFromMenu("/perfil")}
            >
              <Text className="px-3 text-base text-neutral-900">Perfil</Text>
            </Pressable>
            <Pressable
              className="border-b border-neutral-100 py-4 active:bg-neutral-50"
              onPress={() => goFromMenu("/ubicaciones")}
            >
              <Text className="px-3 text-base text-neutral-900">Ubicaciones</Text>
            </Pressable>
            <Pressable
              className="border-b border-neutral-100 py-4 active:bg-neutral-50"
              onPress={() => goFromMenu("/agregar-producto")}
            >
              <Text className="px-3 text-base text-neutral-900">
                Agregar producto
              </Text>
            </Pressable>
            <Pressable
              className="py-4 active:bg-neutral-50"
              onPress={() => void signOutAndGoToLogin()}
            >
              <Text className="px-3 text-base font-semibold text-red-600">
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 88 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-2 px-4 pb-3 pt-1">
          <Pressable
            accessibilityLabel="Menú"
            className="shrink-0 p-2 active:opacity-60"
            hitSlop={10}
            onPress={openMenu}
          >
            <Ionicons name="menu" size={26} color="#171717" />
          </Pressable>
          <Pressable
            accessibilityLabel="Elegir zona en el mapa"
            className="min-w-0 flex-1 flex-row items-center gap-1 rounded-full bg-neutral-100 px-3 py-2 active:opacity-80"
            onPress={openLocationPicker}
          >
            {locationLoading ? (
              <ActivityIndicator color="#ea580c" size="small" />
            ) : (
              <Ionicons name="location-outline" size={18} color="#ea580c" />
            )}
            <Text
              className="min-w-0 flex-1 text-base font-semibold text-neutral-900"
              numberOfLines={1}
            >
              {locationLoading && !zone ? "Ubicación…" : zone || "—"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#737373" />
          </Pressable>
          <Pressable
            accessibilityLabel="Notificaciones"
            className="shrink-0 p-2 active:opacity-60"
            hitSlop={10}
            onPress={openNotifications}
          >
            <Ionicons name="notifications-outline" size={26} color="#171717" />
          </Pressable>
          <Pressable
            accessibilityLabel="Carrito"
            className="shrink-0 p-2 active:opacity-60"
            hitSlop={10}
          >
            <Ionicons name="cart-outline" size={26} color="#171717" />
          </Pressable>
        </View>

        <View className="pb-5">
          <View className="mb-3 flex-row items-center justify-between px-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="book-outline" size={20} color="#171717" />
              <Text className="text-lg font-bold text-neutral-900">
                Categorías
              </Text>
            </View>
            <Pressable hitSlop={8}>
              <Text className="text-sm font-semibold text-emerald-600">
                Ver todas
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            contentContainerClassName="gap-3 px-4"
            showsHorizontalScrollIndicator={false}
          >
            {PRODUCT_CATEGORIES.map((item) => (
              <Pressable
                key={item.id}
                className="mr-3 w-[76px] items-center active:opacity-80"
              >
                <View className="mb-2 h-[76px] w-[76px] items-center justify-center rounded-2xl border border-neutral-200 bg-white">
                  <Text className="text-4xl">{item.emoji}</Text>
                </View>
                <Text className="text-center text-xs font-medium text-neutral-800">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="px-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" size={20} color="#ea580c" />
              <Text className="text-lg font-bold text-neutral-900">
                Cerca de ti
              </Text>
            </View>
            {products.length > 0 ? (
              <Pressable hitSlop={8}>
                <Text className="text-sm font-semibold text-emerald-600">
                  Ver todos
                </Text>
              </Pressable>
            ) : null}
          </View>

          {productsLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="small" color="#ea580c" />
            </View>
          ) : products.length === 0 ? (
            <View className="items-center px-6 py-12">
              <Text className="text-center text-base leading-6 text-neutral-600">
                Todavía no hay ningún producto, pronto habrá nuevos.
              </Text>
            </View>
          ) : (
            products.map((product) => {
              const cat = categoryById(product.category_id);
              const emoji = cat?.emoji ?? "📦";
              return (
                <Pressable
                  key={product.id}
                  className="mb-4 flex-row overflow-hidden rounded-2xl border border-neutral-200 bg-white active:opacity-90"
                >
                  <View className="h-[112px] w-[112px] items-center justify-center bg-neutral-100">
                    <Text className="text-5xl">{emoji}</Text>
                  </View>
                  <View className="min-w-0 flex-1 justify-center px-3 py-2">
                    <Text
                      className="text-base font-bold text-neutral-900"
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <Text
                      className="text-sm text-neutral-500"
                      numberOfLines={2}
                    >
                      {product.address}
                    </Text>
                    {userCoords ? (
                      <View className="mt-1 flex-row items-center gap-1">
                        <Ionicons
                          name="navigate-outline"
                          size={14}
                          color="#737373"
                        />
                        <Text className="text-xs font-medium text-neutral-500">
                          {formatDistanceKm(
                            haversineKm(
                              userCoords.latitude,
                              userCoords.longitude,
                              Number(product.latitude),
                              Number(product.longitude),
                            ),
                          )}
                        </Text>
                      </View>
                    ) : null}
                    <View className="mt-2 flex-row flex-wrap items-baseline gap-2">
                      <Text className="text-lg text-neutral-400 line-through">
                        ${Number(product.price_normal).toFixed(2)}
                      </Text>
                      <Text className="text-lg font-bold text-orange-600">
                        ${Number(product.price_offer).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <View
        className="absolute right-4"
        style={{ bottom: tabBarHeight + 16 }}
      >
        <Pressable
          className="flex-row items-center gap-2 rounded-full bg-neutral-800 px-4 py-3 shadow-lg active:opacity-90"
          onPress={() => router.push("/map" as never)}
        >
          <Ionicons name="map" size={20} color="#fff" />
          <Text className="font-semibold text-white">Mapa</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
