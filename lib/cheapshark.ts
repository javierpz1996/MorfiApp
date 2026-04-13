export type CheapSharkDeal = {
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  dealID: string;
  storeID: string;
};

const DEALS_BASE = "https://www.cheapshark.com/api/1.0/deals";
const PAGE_SIZE = 20;

async function fetchDealsFromParams(
  sortBy: "Popularity" | "Savings" | "DealRating",
): Promise<CheapSharkDeal[]> {
  const params = new URLSearchParams({
    sortBy,
    pageSize: String(PAGE_SIZE),
  });
  const response = await fetch(`${DEALS_BASE}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data: CheapSharkDeal[] = await response.json();
  return data;
}

/** Lista por popularidad — equivale a `?sortBy=Popularity&pageSize=20` */
export function fetchDealsPopular(): Promise<CheapSharkDeal[]> {
  return fetchDealsFromParams("Popularity");
}

/** Mejores descuentos (% de ahorro) — `?sortBy=Savings&pageSize=20` */
export function fetchDealsBestDiscounts(): Promise<CheapSharkDeal[]> {
  return fetchDealsFromParams("Savings");
}

/** Recomendados (deal rating) — `?sortBy=DealRating&pageSize=20` */
export function fetchDealsRecommended(): Promise<CheapSharkDeal[]> {
  return fetchDealsFromParams("DealRating");
}

/** Sin filtros: el API usa su criterio por defecto (suele ser muchas más filas). */
export async function fetchDeals(): Promise<CheapSharkDeal[]> {
  const response = await fetch(DEALS_BASE);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data: CheapSharkDeal[] = await response.json();
  return data;
}
