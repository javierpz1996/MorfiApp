import { useDeliveryLocation } from "@/contexts/delivery-location-context";
import { categoryById } from "@/lib/product-categories";
import { setProductLocationPick } from "@/lib/product-location-pick";
import { fetchProductsForFeed, type ProductRow } from "@/lib/products";
import { zoneLabelFromGeocode } from "@/lib/zone-label";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const pickRaw = useLocalSearchParams<{ pick?: string | string[] }>().pick;
  const pickParam = Array.isArray(pickRaw) ? pickRaw[0] : pickRaw;
  const isPickerMode = pickParam === "1" || pickParam === "true";

  const intentRaw = useLocalSearchParams<{ intent?: string | string[] }>()
    .intent;
  const intentParam = Array.isArray(intentRaw) ? intentRaw[0] : intentRaw;
  const isProductIntent = intentParam === "product";
  const { setManualLocation, manualLocation } = useDeliveryLocation();
  const manualRef = useRef(manualLocation);
  manualRef.current = manualLocation;

  const [region, setRegion] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickCenter, setPickCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pickBusy, setPickBusy] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      setLoading(false);
      setError(
        isPickerMode
          ? "Elegir ubicación en el mapa está disponible en la app instalada (iOS o Android)."
          : "El mapa con GPS está disponible en la app instalada (iOS o Android).",
      );
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError(
            "Activá la ubicación en ajustes para ver el mapa y tu posición.",
          );
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        let { latitude, longitude } = loc.coords;
        const saved = manualRef.current;
        if (isPickerMode && saved) {
          latitude = saved.latitude;
          longitude = saved.longitude;
        }
        const next: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        };
        setRegion(next);
        if (isPickerMode) {
          setPickCenter({ latitude, longitude });
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo obtener tu ubicación actual.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [isPickerMode]);

  useEffect(() => {
    if (Platform.OS === "web" || isPickerMode || loading || error) {
      if (isPickerMode || Platform.OS === "web") setProducts([]);
      return;
    }
    let alive = true;
    void fetchProductsForFeed()
      .then((list) => {
        if (alive) setProducts(list);
      })
      .catch(() => {
        if (alive) setProducts([]);
      });
    return () => {
      alive = false;
    };
  }, [isPickerMode, loading, error]);

  useEffect(() => {
    if (
      Platform.OS === "web" ||
      isPickerMode ||
      loading ||
      error ||
      products.length === 0
    ) {
      return;
    }
    const userPoint = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    const pts = products
      .map((p) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      }))
      .filter(
        (c) =>
          Number.isFinite(c.latitude) &&
          Number.isFinite(c.longitude) &&
          Math.abs(c.latitude) <= 90 &&
          Math.abs(c.longitude) <= 180,
      );
    if (pts.length === 0) return;
    const all = [...pts, userPoint];
    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(all, {
        edgePadding: { top: 100, right: 40, bottom: 100, left: 40 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [
    products,
    region.latitude,
    region.longitude,
    isPickerMode,
    loading,
    error,
  ]);

  const onRegionChangeComplete = useCallback(
    (r: Region) => {
      if (isPickerMode) {
        setPickCenter({ latitude: r.latitude, longitude: r.longitude });
      }
    },
    [isPickerMode],
  );

  const confirmPick = async () => {
    if (!pickCenter) return;
    setPickBusy(true);
    try {
      const geo = await Location.reverseGeocodeAsync({
        latitude: pickCenter.latitude,
        longitude: pickCenter.longitude,
      });
      const label =
        zoneLabelFromGeocode(geo) ||
        `${pickCenter.latitude.toFixed(3)}, ${pickCenter.longitude.toFixed(3)}`;
      if (isProductIntent) {
        await setProductLocationPick({
          latitude: pickCenter.latitude,
          longitude: pickCenter.longitude,
          label,
        });
      } else {
        await setManualLocation({
          latitude: pickCenter.latitude,
          longitude: pickCenter.longitude,
          label,
        });
      }
      router.back();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo guardar la ubicación.";
      Alert.alert("Ubicación", msg);
    } finally {
      setPickBusy(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-6 text-center text-base text-neutral-600">
          {error}
        </Text>
        <Pressable
          className="rounded-xl bg-orange-600 px-6 py-3 active:opacity-80"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white">Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-900">
      {loading ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-neutral-600">Obteniendo tu ubicación…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="mb-6 text-center text-base text-neutral-600">
            {error}
          </Text>
          <Pressable
            className="rounded-xl bg-orange-600 px-6 py-3 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-white">Volver</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            mapType="standard"
            onRegionChangeComplete={
              isPickerMode ? onRegionChangeComplete : undefined
            }
            showsBuildings
            showsCompass
            showsMyLocationButton={Platform.OS === "android" && !isPickerMode}
            showsUserLocation
            toolbarEnabled={false}
          >
            {!isPickerMode
              ? products
                  .filter((p) => {
                    const lat = Number(p.latitude);
                    const lng = Number(p.longitude);
                    return (
                      Number.isFinite(lat) &&
                      Number.isFinite(lng) &&
                      Math.abs(lat) <= 90 &&
                      Math.abs(lng) <= 180
                    );
                  })
                  .map((p) => {
                    const lat = Number(p.latitude);
                    const lng = Number(p.longitude);
                    const cat = categoryById(p.category_id);
                    const title = cat
                      ? `${cat.emoji} ${p.name}`.slice(0, 60)
                      : p.name.slice(0, 60);
                    const offer = `$${Number(p.price_offer).toFixed(2)}`;
                    const desc = `${offer} · ${p.address}`.slice(0, 120);
                    return (
                      <Marker
                        key={p.id}
                        coordinate={{ latitude: lat, longitude: lng }}
                        description={desc}
                        title={title}
                        tracksViewChanges={false}
                      />
                    );
                  })
              : null}
          </MapView>
          {isPickerMode ? (
            <>
              <View
                pointerEvents="none"
                className="absolute inset-0 items-center justify-center"
              >
                <View className="-mt-10 items-center">
                  <Ionicons name="location-sharp" size={52} color="#ea580c" />
                </View>
              </View>
              <SafeAreaView
                className="absolute left-0 right-0 top-0"
                edges={["top"]}
              >
                <Pressable
                  accessibilityLabel="Volver"
                  className="ml-3 mt-1 self-start rounded-full bg-white p-3 shadow-md active:opacity-80"
                  hitSlop={8}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color="#171717" />
                </Pressable>
              </SafeAreaView>
              <SafeAreaView
                className="absolute bottom-0 left-0 right-0 px-4"
                edges={["bottom"]}
              >
                <Text className="mb-3 text-center text-sm text-white drop-shadow-md">
                  {isProductIntent
                    ? "Mové el mapa hasta el punto donde está o se retira el producto."
                    : "Mové el mapa hasta que el pin quede en el punto de entrega o recogida."}
                </Text>
                <Pressable
                  className={
                    pickBusy || !pickCenter
                      ? "items-center rounded-2xl bg-orange-400 py-4"
                      : "items-center rounded-2xl bg-orange-600 py-4 active:opacity-90"
                  }
                  disabled={pickBusy || !pickCenter}
                  onPress={() => void confirmPick()}
                >
                  {pickBusy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-center text-base font-semibold text-white">
                      Usar esta ubicación
                    </Text>
                  )}
                </Pressable>
              </SafeAreaView>
            </>
          ) : (
            <SafeAreaView
              className="absolute left-0 right-0 top-0"
              edges={["top"]}
            >
              <Pressable
                accessibilityLabel="Volver"
                className="ml-3 mt-1 self-start rounded-full bg-white p-3 shadow-md active:opacity-80"
                hitSlop={8}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#171717" />
              </Pressable>
            </SafeAreaView>
          )}
        </>
      )}
    </View>
  );
}
