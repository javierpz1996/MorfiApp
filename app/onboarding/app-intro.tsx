import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { setAppIntroOnboardingComplete } from "@/lib/app-intro-onboarding";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingAppIntro() {
  const { session, loading } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [finishing, setFinishing] = useState(false);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const userId = session.user.id;

  const goNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    setFinishing(true);
    await setAppIntroOnboardingComplete(userId);
    router.replace("/(tabs)" as never);
    setFinishing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <View className="mb-8 w-full items-center">
          <View className="w-full max-w-[320px]">
            <Progress
              value={(step / 3) * 100}
              size="2xl"
              className="w-full rounded-full bg-orange-100"
            >
              <ProgressFilledTrack className="bg-orange-600" />
            </Progress>
          </View>
          <Text className="mt-3 text-sm text-neutral-500">
            Paso {step} de 3
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <View className="gap-3">
              <Text className="text-center text-2xl font-bold text-neutral-900">
                ¿Qué es MorfiApp?
              </Text>
              <Text className="text-center text-base leading-6 text-neutral-600">
                MorfiApp te ayuda a encontrar comida y productos con buen precio
                cerca tuyo, priorizando lo que está por vencer o en oferta para
                que llenes la heladera y reduzcas el desperdicio.
              </Text>
            </View>
          ) : null}

          {step === 2 ? (
            <View className="gap-3">
              <Text className="text-center text-2xl font-bold text-neutral-900">
                Cómo funciona
              </Text>
              <Text className="text-base leading-6 text-neutral-600">
                • Explorá tiendas y comercios cercanos según tu zona.{"\n\n"}
                • Mirá paquetes y productos disponibles con precios claros.{"\n\n"}
                • Reservá o retirá según lo que habilite cada comercio.{"\n\n"}
                • Todo pensado para que ahorres tiempo y elijas mejor en el día a
                día.
              </Text>
            </View>
          ) : null}

          {step === 3 ? (
            <View className="gap-3">
              <Text className="text-center text-2xl font-bold text-neutral-900">
                Tu impacto
              </Text>
              <Text className="text-center text-base leading-6 text-neutral-600">
                Cada compra consciente suma: menos comida tirada, más ahorro y
                comercios que rotan mejor su stock. MorfiApp es tu aliado para
                comer bien y cuidar el bolsillo.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <Pressable
          className={
            finishing
              ? "mb-2 items-center rounded-xl bg-orange-300 py-4"
              : "mb-2 items-center rounded-xl bg-orange-600 py-4 active:opacity-90"
          }
          disabled={finishing}
          onPress={goNext}
        >
          {finishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-base font-semibold text-white">
              Siguiente
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
