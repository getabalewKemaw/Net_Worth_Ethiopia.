import React from "react";
import { View, TextInput, type TextInputProps } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, containerClassName, className, ...props }) => {
  const theme = useTheme();

  return (
    <View className={`gap-1.5 w-full ${containerClassName || ""}`}>
      <ThemedText className="text-sm font-semibold">{label}</ThemedText>
      <TextInput
        style={[
          { backgroundColor: theme.backgroundElement, color: theme.text },
          style,
        ]}
        className={`px-4 py-3 rounded-[10px] text-base ${
          error ? "border border-red-600" : ""
        } ${className || ""}`}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {error ? <ThemedText className="text-red-600 text-xs">{error}</ThemedText> : null}
    </View>
  );
};
