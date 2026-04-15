import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginEmail() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Faltan datos", "Introduce email y contraseña.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert("No se pudo iniciar sesión", error.message);
      return;
    }

    router.replace("/(tabs)" as never);
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
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text className="text-center font-rubik-semibold text-2xl text-ink">
              Iniciar sesión
            </Text>
            <Text className="mt-2 text-center font-karla text-base text-text-gray">
              Usá tu correo y contraseña.
            </Text>
          </View>

          <Text className="mb-1 text-sm font-medium text-neutral-700">Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            className="mb-6 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900"
            editable={!submitting}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
          />

          <Text className="mb-1 text-sm font-medium text-neutral-700">
            Contraseña
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            className="mb-6 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900"
            editable={!submitting}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
          />

          <Pressable
            className={
              submitting
                ? "mb-6 items-center rounded-xl bg-orange-300 py-3.5"
                : "mb-6 items-center rounded-xl bg-orange-600 py-3.5 active:opacity-80"
            }
            disabled={submitting}
            onPress={handleLogin}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-semibold text-white">Entrar</Text>
            )}
          </Pressable>

          <Pressable
            className="items-center py-2"
            onPress={() => router.back()}
          >
            <Text className="text-orange-700 underline">Volver</Text>
          </Pressable>

          <Link href="/(auth)/register" asChild>
            <Pressable className="mt-6 items-center py-2">
              <Text className="text-orange-700 underline">
                ¿No tienes cuenta? Regístrate
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

