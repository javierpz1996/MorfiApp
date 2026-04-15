import type { LocationGeocodedAddress } from "expo-location";

export function zoneLabelFromGeocode(
  placemarks: LocationGeocodedAddress[],
): string {
  const p = placemarks[0];
  if (!p) return "";
  const barrio = p.district ?? p.subregion ?? p.name;
  const ciudad = p.city ?? p.region;
  if (barrio && ciudad && barrio !== ciudad) {
    return `${barrio}, ${ciudad}`;
  }
  return ciudad ?? barrio ?? p.region ?? p.name ?? "";
}
