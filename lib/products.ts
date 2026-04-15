import { supabase } from "@/lib/supabase";

export type ProductRow = {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  price_normal: number;
  price_offer: number;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type NewProductInput = {
  userId: string;
  name: string;
  categoryId: string;
  priceNormal: number;
  priceOffer: number;
  address: string;
  latitude: number;
  longitude: number;
};

export async function insertProduct(input: NewProductInput) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      category_id: input.categoryId,
      price_normal: input.priceNormal,
      price_offer: input.priceOffer,
      address: input.address.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function fetchProductsForFeed(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, user_id, name, category_id, price_normal, price_offer, address, latitude, longitude, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as ProductRow[];
}
