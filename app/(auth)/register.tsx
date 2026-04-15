import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Register() {
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

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
      Alert.alert("No se pudo continuar con Google", error?.message ?? "Error.");
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
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-8 text-center text-2xl font-bold text-neutral-900">
          Registrarme en MorfiApp
        </Text>

        <Pressable
          className="mb-4 items-center rounded-xl bg-orange-600 py-3.5 active:opacity-80"
          disabled={oauthSubmitting}
          onPress={() => router.push("/(auth)/register-email" as any)}
        >
          <Text className="font-semibold text-white">
            Registrarte con tu correo
          </Text>
        </Pressable>

        <Pressable
          className="mb-6 flex-row items-center justify-center gap-3 rounded-xl border border-orange-200 bg-white py-3.5 active:opacity-80"
          disabled={oauthSubmitting}
          onPress={handleGoogle}
        >
          {oauthSubmitting ? (
            <ActivityIndicator />
          ) : (
            <>
              <View className="h-6 w-6 items-center justify-center rounded-full bg-orange-600">
                <Text className="text-xs font-bold text-white">G</Text>
              </View>
              <Text className="font-semibold text-neutral-900">
                Continuar con Google
              </Text>
            </>
          )}
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="items-center py-2">
            <Text className="text-orange-700 underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </Pressable>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
