import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (userId: string) => `morfi_location_onboarding_done_${userId}`;

export async function hasCompletedLocationOnboarding(
  userId: string,
): Promise<boolean> {
  const v = await AsyncStorage.getItem(key(userId));
  return v === "1";
}

export async function setLocationOnboardingComplete(userId: string) {
  await AsyncStorage.setItem(key(userId), "1");
}
