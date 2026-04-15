export const PRODUCT_CATEGORIES = [
  { id: "1", label: "Pan", emoji: "🥖" },
  { id: "2", label: "Abarrotes", emoji: "🛒" },
  { id: "3", label: "Postres", emoji: "🍰" },
  { id: "4", label: "Restaurantes", emoji: "🍗" },
  { id: "5", label: "Saludable", emoji: "🥒" },
] as const;

export type ProductCategoryId = (typeof PRODUCT_CATEGORIES)[number]["id"];

export function categoryById(id: string) {
  return PRODUCT_CATEGORIES.find((c) => c.id === id);
}
