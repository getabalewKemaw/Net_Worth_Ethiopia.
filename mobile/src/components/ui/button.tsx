import React from "react";
import { Pressable, ActivityIndicator, type PressableProps } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ title, loading, style, disabled, className, ...props }) => {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        { backgroundColor: theme.primary },
        typeof style === "function" ? (style as any)({ pressed: false }) : style,
      ]}
      className={`py-3.5 rounded-xl items-center justify-center w-full ${
        disabled || loading ? "opacity-70" : "active:opacity-90"
      } ${className || ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <ThemedText className="text-white text-base font-semibold">{title}</ThemedText>
      )}
    </Pressable>
  );
};
