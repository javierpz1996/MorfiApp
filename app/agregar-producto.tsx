import { useAuth } from "@/contexts/auth-context";
import {
  PRODUCT_CATEGORIES,
  categoryById,
  type ProductCategoryId,
} from "@/lib/product-categories";
import {
  consumeProductLocationPick,
  type ProductLocationPick,
} from "@/lib/product-location-pick";
import { insertProduct } from "@/lib/products";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function parseMoneyInput(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function AgregarProductoScreen() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<ProductCategoryId | "">("");
  const [priceNormalStr, setPriceNormalStr] = useState("");
  const [priceOfferStr, setPriceOfferStr] = useState("");
  const [address, setAddress] = useState("");
  const [mapPick, setMapPick] = useState<ProductLocationPick | null>(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const pick = await consumeProductLocationPick();
        if (pick) setMapPick(pick);
      })();
    }, []),
  );

  const pn = parseMoneyInput(priceNormalStr);
  const po = parseMoneyInput(priceOfferStr);
  const selectedCat = categoryId ? categoryById(categoryId) : undefined;

  const openMapForProduct = () => {
    router.push("/map?pick=1&intent=product" as never);
  };

  const submit = async () => {
    if (!session?.user?.id) {
      Alert.alert("Sesión", "Iniciá sesión para publicar un producto.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Nombre", "Escribí el nombre del producto.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Categoría", "Elegí el tipo de producto.");
      return;
    }
    if (pn === null || po === null) {
      Alert.alert("Precios", "Ingresá precio normal y precio de oferta válidos.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Dirección", "Completá la dirección.");
      return;
    }
    if (!mapPick) {
      Alert.alert(
        "Ubicación",
        "Usá el mapa para marcar dónde está o se retira el producto.",
      );
      return;
    }
    if (po >= pn) {
      Alert.alert(
        "Precios",
        "El precio de oferta suele ser menor al precio normal. ¿Querés guardar igual?",
        [
          { text: "Revisar", style: "cancel" },
          {
            text: "Guardar igual",
            onPress: () => void saveProduct(session.user.id),
          },
        ],
      );
      return;
    }
    await saveProduct(session.user.id);
  };

  const saveProduct = async (userId: string) => {
    if (pn === null || po === null || !mapPick || !categoryId) return;
    setSubmitting(true);
    try {
      await insertProduct({
        userId,
        name: name.trim(),
        categoryId,
        priceNormal: pn,
        priceOffer: po,
        address: address.trim(),
        latitude: mapPick.latitude,
        longitude: mapPick.longitude,
      });
      Alert.alert("Listo", "Tu producto ya está publicado.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo guardar. Probá de nuevo.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          Agregar producto
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

      <Modal
        animationType="fade"
        transparent
        visible={categoryModal}
        onRequestClose={() => setCategoryModal(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Cerrar"
            className="absolute bottom-0 left-0 right-0 top-0 bg-black/40"
            onPress={() => setCategoryModal(false)}
          />
          <View className="rounded-t-3xl bg-white px-2 pb-8 pt-4">
            <Text className="mb-3 px-3 text-lg font-bold text-neutral-900">
              Tipo de producto
            </Text>
            {PRODUCT_CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                className="flex-row items-center gap-3 border-b border-neutral-100 py-4 active:bg-neutral-50"
                onPress={() => {
                  setCategoryId(c.id);
                  setCategoryModal(false);
                }}
              >
                <Text className="text-2xl">{c.emoji}</Text>
                <Text className="flex-1 text-base text-neutral-900">{c.label}</Text>
                {categoryId === c.id ? (
                  <Ionicons name="checkmark-circle" size={22} color="#ea580c" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!session ? (
            <Text className="text-base text-neutral-600">
              Iniciá sesión para publicar productos.
            </Text>
          ) : null}

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Nombre
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900"
            editable={!!session}
            onChangeText={setName}
            placeholder="Ej. Bollería surtida"
            placeholderTextColor="#a3a3a3"
            value={name}
          />

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Tipo de producto
          </Text>
          <Pressable
            className="mb-4 flex-row items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 active:opacity-80"
            disabled={!session}
            onPress={() => setCategoryModal(true)}
          >
            <Text
              className={
                selectedCat
                  ? "text-base text-neutral-900"
                  : "text-base text-neutral-400"
              }
            >
              {selectedCat
                ? `${selectedCat.emoji} ${selectedCat.label}`
                : "Elegir categoría"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#737373" />
          </Pressable>

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Precio normal
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900"
            editable={!!session}
            keyboardType="decimal-pad"
            onChangeText={setPriceNormalStr}
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            value={priceNormalStr}
          />

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Precio de oferta
          </Text>
          <TextInput
            className="mb-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900"
            editable={!!session}
            keyboardType="decimal-pad"
            onChangeText={setPriceOfferStr}
            placeholder="0.00"
            placeholderTextColor="#a3a3a3"
            value={priceOfferStr}
          />

          {pn !== null && po !== null ? (
            <View className="mb-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
              <Text className="mb-1 text-xs font-semibold uppercase text-orange-800">
                Vista previa
              </Text>
              <View className="flex-row flex-wrap items-baseline gap-2">
                <Text className="text-lg text-neutral-500 line-through">
                  {formatMoney(pn)}
                </Text>
                <Text className="text-xl font-bold text-orange-600">
                  {formatMoney(po)}
                </Text>
              </View>
            </View>
          ) : null}

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Dirección
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900"
            editable={!!session}
            multiline
            numberOfLines={2}
            onChangeText={setAddress}
            placeholder="Calle, número, referencias"
            placeholderTextColor="#a3a3a3"
            textAlignVertical="top"
            value={address}
          />

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Ubicación en el mapa
          </Text>
          <Pressable
            className="mb-2 flex-row items-center gap-2 rounded-xl border border-dashed border-orange-400 bg-orange-50/80 px-4 py-4 active:opacity-90"
            disabled={!session}
            onPress={openMapForProduct}
          >
            <Ionicons name="map-outline" size={24} color="#ea580c" />
            <View className="min-w-0 flex-1">
              <Text className="font-semibold text-orange-700">
                Elegir en el mapa
              </Text>
              <Text className="text-sm text-neutral-600">
                Mové el mapa y confirmá el punto exacto
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ea580c" />
          </Pressable>
          {mapPick ? (
            <View className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Punto elegido
              </Text>
              <Text className="text-sm text-neutral-800">{mapPick.label}</Text>
            </View>
          ) : (
            <Text className="mb-6 text-sm text-neutral-500">
              Todavía no marcaste una ubicación en el mapa.
            </Text>
          )}

          <Pressable
            className={
              submitting || !session
                ? "items-center rounded-xl bg-orange-300 py-4"
                : "items-center rounded-xl bg-orange-600 py-4 active:opacity-90"
            }
            disabled={submitting || !session}
            onPress={() => void submit()}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Guardar producto
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
