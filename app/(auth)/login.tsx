import { PressableButton } from "@/components/ui/pressable-button";
import { supabase } from "@/lib/supabase";
import * as AuthSession from "expo-auth-session";
import { Link, router } from "expo-router";
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

const logoApp = require("../../assets/images/logo-app.png");
const googleIcon = require("../../assets/images/g-icon.png");

export default function Login() {
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

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
          contentContainerClassName="flex-grow justify-center px-6 py-12"
        >
          <View className="mb-10 items-center gap-5">
            <View className="items-center">
              <Image
                accessibilityLabel="Logo"
                source={logoApp}
                style={{ width: 170, height: 140 }}
                resizeMode="contain"
              />
              <Text className="mb-1 text-center font-rubik-semibold text-2xl leading-7 text-ink">
                Evita el desperdicio
              </Text>
              <Text className="text-center font-rubik-semibold text-2xl leading-7 text-ink">
                llena tu heladera de ofertas
              </Text>
              <View className="mt-6 items-center">
                <Text className="text-center font-karla text-base leading-5 text-text-gray">
                  Descubrí ofertas que valen la pena,
                </Text>
                <Text className="text-center font-karla text-base leading-6 text-text-gray">
                  paga menos por más
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6 gap-3">
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

          <Link href="/(auth)/register" asChild>
            <Pressable className="items-center">
              <Text className="text-brand-orange underline">
                ¿No tienes cuenta? Regístrate
              </Text>
            </Pressable>
          </Link>

          <Text className="mt-6 text-center font-karla text-sm leading-4 text-gray-light">
            Al continuar, aceptas los Terminos y condiciones de Food
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
