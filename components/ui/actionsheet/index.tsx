import * as NavigationBar from "expo-navigation-bar";
import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ActionsheetCtxValue = {
  onClose?: () => void;
  open: SharedValue<number>;
};

const ActionsheetCtx = createContext<ActionsheetCtxValue | null>(null);

export type ActionsheetProps = PropsWithChildren<{
  isOpen: boolean;
  onClose?: () => void;
}>;

function useActionsheetCtx() {
  const ctx = useContext(ActionsheetCtx);
  if (!ctx) {
    throw new Error(
      "Actionsheet components must be used within <Actionsheet />",
    );
  }
  return ctx;
}

/** Minimal Actionsheet API compatible with gluestack usage. */
export function Actionsheet({ isOpen, onClose, children }: ActionsheetProps) {
  const [modalVisible, setModalVisible] = useState(isOpen);
  const open = useSharedValue(isOpen ? 1 : 0);

  const ctxValue = useMemo<ActionsheetCtxValue>(
    () => ({ onClose, open }),
    [onClose, open],
  );

  useEffect(() => {
    if (Platform.OS === "android") {
      // When the sheet is open, force a dark nav bar (black background on 3-button nav).
      NavigationBar.setButtonStyleAsync("light").catch(() => {});
      NavigationBar.setStyle(isOpen ? "dark" : "auto");
    }

    if (isOpen) {
      setModalVisible(true);
      open.value = withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    // Animate out, then unmount the modal to avoid abrupt disappearance.
    open.value = withTiming(
      0,
      { duration: 260, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setModalVisible)(false);
      },
    );
  }, [isOpen, open]);

  return (
    <ActionsheetCtx.Provider value={ctxValue}>
      <Modal
        animationType="none"
        transparent
        statusBarTranslucent
        // Keep navigation bar opaque so it can stay black.
        visible={modalVisible}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end">{children}</View>
      </Modal>
    </ActionsheetCtx.Provider>
  );
}

export function ActionsheetBackdrop({
  children,
}: PropsWithChildren<{
  children?: ReactNode;
}>) {
  const { onClose } = useActionsheetCtx();
  const { open } = useActionsheetCtx();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(open.value, [0, 1], [0, 1]),
    };
  }, [open]);

  return (
    <Animated.View
      pointerEvents="auto"
      className="absolute bottom-0 left-0 right-0 top-0"
      style={animatedStyle}
    >
      <Pressable
        accessibilityLabel="Cerrar"
        className="absolute bottom-0 left-0 right-0 top-0 bg-black/45"
        onPress={onClose}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function ActionsheetContent({ children }: PropsWithChildren) {
  const { open } = useActionsheetCtx();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(open.value, [0, 1], [height, 0]),
        },
      ],
    };
  }, [open, height]);

  return (
    <Animated.View
      className="rounded-t-3xl bg-white px-2 pt-3 shadow-2xl"
      // Avoid a huge bottom gap on Android (esp. with edge-to-edge/nav modes).
      style={[animatedStyle, { paddingBottom: 8 }]}
    >
      {children}
    </Animated.View>
  );
}

export function ActionsheetDragIndicatorWrapper({
  children,
}: PropsWithChildren) {
  return <View className="items-center pb-2">{children}</View>;
}

export function ActionsheetDragIndicator() {
  return <View className="h-1.5 w-12 rounded-full bg-neutral-200" />;
}

export function ActionsheetItem({
  children,
  onPress,
  isDisabled,
}: PropsWithChildren<{
  onPress?: () => void;
  isDisabled?: boolean;
}>) {
  return (
    <Pressable
      className={isDisabled ? "opacity-50" : "active:bg-neutral-50"}
      disabled={isDisabled}
      onPress={onPress}
    >
      <View className="px-3 py-6">{children}</View>
    </Pressable>
  );
}

export function ActionsheetItemText({ children }: PropsWithChildren) {
  return (
    <Text className="text-ink" style={{ fontWeight: "500" }}>
      {children}
    </Text>
  );
}
