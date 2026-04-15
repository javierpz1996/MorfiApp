import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

function isValidEmail(email: string) {
  // Simple, practical validation for UI feedback.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasUppercase(password: string) {
  return /[A-Z]/.test(password);
}

function hasNumber(password: string) {
  return /\d/.test(password);
}

function hasMinLength(password: string, min: number) {
  return password.length >= min;
}

type Gender = "hombre" | "mujer" | null;
type Interest = "verduras" | "carnes" | "lacteos" | "panaderia";

export default function RegisterEmail() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>(null);

  const [interests, setInterests] = useState<Set<Interest>>(
    () => new Set<Interest>(),
  );

  const [submitting, setSubmitting] = useState(false);

  const emailOk = useMemo(() => isValidEmail(email.trim()), [email]);
  const lengthOk = useMemo(() => hasMinLength(password, 9), [password]);
  const uppercaseOk = useMemo(() => hasUppercase(password), [password]);
  const numberOk = useMemo(() => hasNumber(password), [password]);
  const passwordOk = lengthOk && uppercaseOk && numberOk;
  const canGoStep1 = emailOk && passwordOk && !submitting;
  const nameOk = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canGoStep2 = nameOk && !submitting;
  const canFinish = interests.size > 0 && !submitting;

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) next.delete(interest);
      else next.add(interest);
      return next;
    });
  };

  const handleFinishRegister = async () => {
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Email inválido", "Revisa el formato del email.");
      return;
    }
    if (
      !hasMinLength(password, 9) ||
      !hasUppercase(password) ||
      !hasNumber(password)
    ) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 9 caracteres, 1 mayúscula y 1 número.",
      );
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Faltan datos", "Completa tu nombre y apellido.");
      return;
    }
    if (interests.size === 0) {
      Alert.alert("Faltan datos", "Elige al menos 1 interés.");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          ...(gender ? { gender } : {}),
          interests: Array.from(interests),
        },
      },
    });
    setSubmitting(false);

    if (error) {
      Alert.alert("No se pudo crear la cuenta", error.message);
      return;
    }

    if (data.session) {
      router.replace("/(tabs)" as never);
      return;
    }

    Alert.alert(
      "Revisa tu correo",
      "Si tu proyecto exige confirmar el email, abre el enlace que te enviamos y luego inicia sesión.",
    );
    router.replace("/(auth)/login");
  };

  const handleHeaderBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          <View className="mb-8 mt-3 w-full flex-row items-center">
            <Pressable
              accessibilityLabel="Volver"
              className="w-11 items-center rounded-full p-2 active:opacity-70"
              disabled={submitting}
              hitSlop={12}
              onPress={handleHeaderBack}
            >
              <Ionicons name="arrow-back" size={26} color="#ea580c" />
            </Pressable>
            <View className="flex-1 items-center justify-center px-1">
              <View className="w-full max-w-[320px]">
                <Progress
                  value={(step / 3) * 100}
                  size="2xl"
                  className="w-full rounded-full bg-orange-100"
                >
                  <ProgressFilledTrack className="bg-orange-600" />
                </Progress>
              </View>
            </View>
            <View className="w-11" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="justify-start px-1 pb-3 pt-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full max-w-md items-center self-center">
              <Text className="w-full text-center text-2xl font-bold text-neutral-900">
                Registrarte con tu correo
              </Text>

              <View className="mt-24 w-full items-center">
                {step === 1 ? (
                  <>
                    <Text className="mb-1 w-full text-sm font-medium text-neutral-700">
                      Correo electrónico
                    </Text>
                    <View className="mb-4 w-full flex-row items-center justify-center gap-3">
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect={false}
                        keyboardType="email-address"
                        className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-white px-4 py-3 text-neutral-900"
                        editable={!submitting}
                        onChangeText={setEmail}
                        placeholder="tu@email.com"
                        placeholderTextColor="#a3a3a3"
                        value={email}
                      />
                      <Text
                        className={
                          emailOk
                            ? "text-lg text-green-600"
                            : "text-lg text-red-600"
                        }
                      >
                        {email.length === 0 ? "" : emailOk ? "✓" : "✕"}
                      </Text>
                    </View>

                    <Text className="mb-1 w-full text-sm font-medium text-neutral-700">
                      Contraseña
                    </Text>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="new-password"
                      className="mb-4 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-neutral-900"
                      editable={!submitting}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#a3a3a3"
                      secureTextEntry
                      value={password}
                    />

                    <View className="mb-8 w-full gap-2">
                      <View className="flex-row rounded-xl px-2">
                        <Text
                          className={
                            lengthOk
                              ? "mr-2 text-base text-green-600"
                              : "mr-2 text-base text-red-500"
                          }
                        >
                          {lengthOk ? "✓" : "✕"}
                        </Text>
                        <Text className="text-sm text-neutral-800">
                          Mínimo 9 caracteres
                        </Text>
                      </View>
                      <View className="flex-row rounded-xl px-2">
                        <Text
                          className={
                            uppercaseOk
                              ? "mr-2 text-base text-green-600"
                              : "mr-2 text-base text-red-500"
                          }
                        >
                          {uppercaseOk ? "✓" : "✕"}
                        </Text>
                        <Text className="text-sm text-neutral-800">
                          Mínimo 1 mayúscula
                        </Text>
                      </View>
                      <View className="flex-row  rounded-xl px-2">
                        <Text
                          className={
                            numberOk
                              ? "mr-2 text-base text-green-600"
                              : "mr-2 text-base text-red-500"
                          }
                        >
                          {numberOk ? "✓" : "✕"}
                        </Text>
                        <Text className="text-sm text-neutral-800">
                          Mínimo 1 número
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      className={
                        canGoStep1
                          ? "mb-4 w-full items-center rounded-xl bg-orange-600 py-3.5 active:opacity-80"
                          : "mb-4 w-full items-center rounded-xl bg-orange-300 py-3.5"
                      }
                      disabled={!canGoStep1}
                      onPress={() => setStep(2)}
                    >
                      <Text className="font-semibold text-white">
                        Siguiente
                      </Text>
                    </Pressable>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <Text className="mb-1 w-full text-sm font-medium text-neutral-700">
                      Nombre
                    </Text>
                    <TextInput
                      autoCapitalize="words"
                      className="mb-4 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-neutral-900"
                      editable={!submitting}
                      onChangeText={setFirstName}
                      placeholder="Tu nombre"
                      placeholderTextColor="#a3a3a3"
                      value={firstName}
                    />

                    <Text className="mb-1 w-full text-sm font-medium text-neutral-700">
                      Apellido
                    </Text>
                    <TextInput
                      autoCapitalize="words"
                      className="mb-6 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-neutral-900"
                      editable={!submitting}
                      onChangeText={setLastName}
                      placeholder="Tu apellido"
                      placeholderTextColor="#a3a3a3"
                      value={lastName}
                    />

                    <Text className="mb-3 w-full text-center text-sm font-medium text-neutral-700">
                      ¿Eres hombre o mujer? (opcional)
                    </Text>
                    <View className="mb-8 w-full flex-row gap-3">
                      <Pressable
                        className={
                          gender === "hombre"
                            ? "flex-1 items-center rounded-xl bg-orange-600 py-3"
                            : "flex-1 items-center rounded-xl border border-orange-200 bg-white py-3"
                        }
                        disabled={submitting}
                        onPress={() => setGender("hombre")}
                      >
                        <Text
                          className={
                            gender === "hombre"
                              ? "font-semibold text-white"
                              : "font-semibold text-neutral-900"
                          }
                        >
                          Hombre
                        </Text>
                      </Pressable>
                      <Pressable
                        className={
                          gender === "mujer"
                            ? "flex-1 items-center rounded-xl bg-orange-600 py-3"
                            : "flex-1 items-center rounded-xl border border-orange-200 bg-white py-3"
                        }
                        disabled={submitting}
                        onPress={() => setGender("mujer")}
                      >
                        <Text
                          className={
                            gender === "mujer"
                              ? "font-semibold text-white"
                              : "font-semibold text-neutral-900"
                          }
                        >
                          Mujer
                        </Text>
                      </Pressable>
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        className="flex-1 items-center rounded-xl border border-orange-200 bg-white py-3 active:opacity-80"
                        disabled={submitting}
                        onPress={() => setStep(1)}
                      >
                        <Text className="font-semibold text-orange-700">
                          Atrás
                        </Text>
                      </Pressable>
                      <Pressable
                        className={
                          canGoStep2
                            ? "flex-1 items-center rounded-xl bg-orange-600 py-3 active:opacity-80"
                            : "flex-1 items-center rounded-xl bg-orange-300 py-3"
                        }
                        disabled={!canGoStep2}
                        onPress={() => setStep(3)}
                      >
                        <Text className="font-semibold text-white">
                          Siguiente
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <Text className="mb-4 text-center text-base font-semibold text-neutral-900">
                      ¿En qué productos estás interesado?
                    </Text>

                    <View className="mb-8 w-full flex-row flex-wrap justify-center gap-3">
                      {(
                        [
                          ["verduras", "Verduras"],
                          ["carnes", "Carnes"],
                          ["lacteos", "Lácteos"],
                          ["panaderia", "Panadería"],
                        ] as const
                      ).map(([key, label]) => {
                        const selected = interests.has(key);
                        return (
                          <Pressable
                            key={key}
                            className={
                              selected
                                ? "w-[48%] items-center rounded-xl bg-orange-600 py-4 active:opacity-80"
                                : "w-[48%] items-center rounded-xl border border-orange-200 bg-white py-4 active:opacity-80"
                            }
                            disabled={submitting}
                            onPress={() => toggleInterest(key)}
                          >
                            <Text
                              className={
                                selected
                                  ? "font-semibold text-white"
                                  : "font-semibold text-neutral-900"
                              }
                            >
                              {label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        className="flex-1 items-center rounded-xl border border-orange-200 bg-white py-3 active:opacity-80"
                        disabled={submitting}
                        onPress={() => setStep(2)}
                      >
                        <Text className="font-semibold text-orange-700">
                          Atrás
                        </Text>
                      </Pressable>
                      <Pressable
                        className={
                          canFinish
                            ? "flex-1 items-center rounded-xl bg-orange-600 py-3 active:opacity-80"
                            : "flex-1 items-center rounded-xl bg-orange-300 py-3"
                        }
                        disabled={!canFinish}
                        onPress={handleFinishRegister}
                      >
                        {submitting ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="font-semibold text-white">
                            Terminar registro
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
