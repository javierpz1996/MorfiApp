import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "md" | "lg";

export type PressableButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hex color to theme the button (e.g. "#F97316") */
  color?: string;
  /** Extra classes for the Pressable container */
  className?: string;
  /** Extra classes for the Text */
  textClassName?: string;
  /** Optional left icon (Ionicons) */
  leftIconName?: keyof typeof Ionicons.glyphMap;
  /** Optional custom left icon (overrides leftIconName) */
  leftIcon?: ReactNode;
};

export function PressableButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "lg",
  color,
  className,
  textClassName,
  leftIconName,
  leftIcon,
}: PressableButtonProps) {
  const isDisabled = disabled || loading;

  const sizeClasses = size === "md" ? "px-6 py-3.5" : "px-6 py-4";

  const base =
    "flex-row items-center justify-center gap-3 min-h-[54px] rounded-full";

  const variantClasses =
    variant === "primary"
      ? isDisabled
        ? "bg-brand-orange/50 shadow-sm"
        : color
          ? "bg-transparent shadow-md active:opacity-90"
          : "bg-brand-orange shadow-md active:opacity-90"
      : variant === "outline"
        ? isDisabled
          ? "border border-neutral-200 bg-white opacity-60 shadow-sm"
          : "border border-neutral-200 bg-white shadow-md active:opacity-90"
        : isDisabled
          ? "bg-transparent opacity-60"
          : "bg-transparent active:opacity-70";

  const textBase = variant === "primary" ? "text-white" : "text-ink";
  const tintColor = variant === "primary" ? "#fff" : "#111827";

  const themedStyle =
    color && !isDisabled
      ? variant === "primary"
        ? { backgroundColor: color }
        : variant === "outline"
          ? { borderColor: color }
          : { }
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      className={[base, sizeClasses, variantClasses, className]
        .filter(Boolean)
        .join(" ")}
      style={themedStyle}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator
          color={tintColor}
        />
      ) : (
        <>
          {leftIcon ? (
            <View className="h-5 w-5 items-center justify-center">
              {leftIcon}
            </View>
          ) : leftIconName ? (
            <Ionicons
              name={leftIconName as any}
              size={20}
              color={tintColor}
            />
          ) : null}
          <Text
            className={[
              "font-karla-semibold text-base",
              textBase,
              textClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

