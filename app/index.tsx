import { useAuth } from "@/contexts/auth-context";
import { hasCompletedAppIntroOnboarding } from "@/lib/app-intro-onboarding";
import { hasCompletedLocationOnboarding } from "@/lib/location-onboarding";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, loading } = useAuth();
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [needsLocationOnboarding, setNeedsLocationOnboarding] = useState(false);
  const [needsAppIntroOnboarding, setNeedsAppIntroOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      setOnboardingReady(true);
      return;
    }

    (async () => {
      const uid = session.user.id;
      const locationDone = await hasCompletedLocationOnboarding(uid);
      setNeedsLocationOnboarding(!locationDone);

      if (locationDone) {
        const introDone = await hasCompletedAppIntroOnboarding(uid);
        setNeedsAppIntroOnboarding(!introDone);
      } else {
        setNeedsAppIntroOnboarding(false);
      }

      setOnboardingReady(true);
    })();
  }, [session, loading]);

  if (loading || !onboardingReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsLocationOnboarding) {
    return <Redirect href="/onboarding/location" />;
  }

  if (needsAppIntroOnboarding) {
    return <Redirect href="/onboarding/app-intro" />;
  }

  return <Redirect href={"/(tabs)" as never} />;
}
