import { PressableButton } from "@/components/ui/pressable-button";
import { supabase } from "@/lib/supabase";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";

const logoApp = require("../../assets/images/logo-app.png");
const googleIcon = require("../../assets/images/g-icon.png");

export default function Login() {
  const [oauthSubmitting, setOauthSubmitting] = useState(false);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const closeRegisterSheet = () => setShowRegisterSheet(false);

  WebBrowser.maybeCompleteAuthSession();

  const handleGoogle = async () => {
    setOauthSubmitting(true);

    const redirectTo = AuthSession.makeRedirectUri({ scheme: "morfiapp" });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error || !data?.url) {
      setOauthSubmitting(false);
      Alert.alert(
        "No se pudo continuar con Google",
        error?.message ?? "Error.",
      );
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
      setOauthSubmitting(false);
      return;
    }

    try {
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      if (!code) {
        throw new Error("No llegó el código de autenticación.");
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;

      router.replace("/(tabs)" as never);
    } catch (e: any) {
      Alert.alert("No se pudo completar el login", e?.message ?? "Error.");
    } finally {
      setOauthSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-6 pt-12 pb-4"
          showsVerticalScrollIndicator={false}
        >
          <Actionsheet isOpen={showRegisterSheet} onClose={closeRegisterSheet}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
              <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>
              <ActionsheetItem
                onPress={() => {
                  closeRegisterSheet();
                  router.push("/(auth)/register-email" as never);
                }}
              >
                <ActionsheetItemText>Crear cuenta con email</ActionsheetItemText>
              </ActionsheetItem>
              <View className="mx-3 h-px bg-neutral-200" />
              <ActionsheetItem
                onPress={() => {
                  closeRegisterSheet();
                  // TODO: definir flujo invitado; por ahora cierra el sheet.
                }}
              >
                <ActionsheetItemText>Entrar como invitado</ActionsheetItemText>
              </ActionsheetItem>
            </ActionsheetContent>
          </Actionsheet>

          <View className="flex-1">
            <View className="flex-1 items-center justify-center gap-8 pt-16">
              <Image
                accessibilityLabel="Logo"
                source={logoApp}
                style={{ width: 170, height: 100 }}
                resizeMode="contain"
              />
              <View className="items-center">
                <Text className="mb-1 text-center font-rubik-semibold text-2xl leading-7 text-ink">
                  Evita el desperdicio
                </Text>
                <Text className="text-center font-rubik-semibold text-2xl leading-7 text-ink">
                  llena tu heladera de ofertas
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-center font-karla text-base leading-5 text-text-gray">
                  Descubrí ofertas que valen la pena,
                </Text>
                <Text className="mt-1 text-center font-karla text-base leading-6 text-text-gray">
                  paga menos por más
                </Text>
              </View>
            </View>

            <View>
              <View className="gap-3">
                <PressableButton
                  title="Continuar con Google"
                  variant="outline"
                  loading={oauthSubmitting}
                  disabled={oauthSubmitting}
                  onPress={handleGoogle}
                  leftIcon={
                    <Image
                      source={googleIcon}
                      style={{ width: 18, height: 18 }}
                      resizeMode="contain"
                    />
                  }
                />
                <PressableButton
                  title="Continuar con tu email"
                  variant="primary"
                  color="#F97316"
                  disabled={oauthSubmitting}
                  onPress={() => router.push("/(auth)/login-email" as never)}
                />
              </View>

              <Pressable
                className="mt-6 items-center"
                onPress={() => setShowRegisterSheet(true)}
              >
                <Text className="text-brand-orange underline">
                  ¿No tienes cuenta? Regístrate
                </Text>
              </Pressable>

              <Text className="mt-6 text-center font-karla text-sm leading-4 text-gray-light">
                Al continuar, aceptas los Terminos y condiciones de Food
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
