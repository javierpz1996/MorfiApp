import Main from "@/components/Main";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral-100">
        <Main />
      </View>
    </SafeAreaProvider>
  );
}
