import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@morfiapp/product_location_pick_v1";

export type ProductLocationPick = {
  latitude: number;
  longitude: number;
  label: string;
};

export async function setProductLocationPick(data: ProductLocationPick) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

/** Lee el último punto elegido en el mapa (formulario producto) y lo borra del storage. */
export async function consumeProductLocationPick(): Promise<ProductLocationPick | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as ProductLocationPick;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.label === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
