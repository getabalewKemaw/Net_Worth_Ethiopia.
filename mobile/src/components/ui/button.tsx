import React from "react";
import { Pressable, StyleSheet, ActivityIndicator, type PressableProps } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, loading, style, disabled, ...props }) => {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary },
        (disabled || loading) ? styles.disabled : null,
        pressed ? styles.pressed : null,
        typeof style === "function" ? (style as any)({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <ThemedText style={styles.text}>{title}</ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  disabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
