import React from "react";
import { View, StyleSheet, TextInput, type TextInputProps } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.backgroundElement, color: theme.text },
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
});
