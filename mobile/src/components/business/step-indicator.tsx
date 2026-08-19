import React from "react";
import { View, Pressable } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

interface StepIndicatorProps {
  step: 1 | 2;
  stepProgress: SharedValue<number>;
  onBack: () => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step, stepProgress, onBack }) => {
  const theme = useTheme();

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${stepProgress.value * 100}%`,
    };
  });

  return (
    <View className="my-4 relative h-[60px] justify-center">
      <View className="absolute h-1 left-6 right-6 bg-[#E0E1E6] rounded-sm top-4">
        <Animated.View className="h-full rounded-sm" style={[{ backgroundColor: theme.primary }, progressStyle]} />
      </View>
      <View className="flex-row justify-between px-3">
        <Pressable onPress={onBack} disabled={step === 1} className="items-center gap-1 active:opacity-70">
          <View className="w-8 h-8 rounded-full items-center justify-center shadow-sm elevation-2" style={{ backgroundColor: theme.primary }}>
            <ThemedText className="text-white font-bold text-sm">1</ThemedText>
          </View>
          <ThemedText className="text-xs font-bold mt-0.5" style={{ color: theme.text }}>Core Profile</ThemedText>
        </Pressable>

        <View className="items-center gap-1">
          <View className="w-8 h-8 rounded-full items-center justify-center shadow-sm elevation-2" style={{ backgroundColor: step === 2 ? theme.primary : theme.backgroundSelected }}>
            <ThemedText className="font-bold text-sm" style={step === 1 ? { color: theme.textSecondary } : { color: "#FFFFFF" }}>2</ThemedText>
          </View>
          <ThemedText className="text-xs font-bold mt-0.5" style={{ color: step === 2 ? theme.text : theme.textSecondary }}>
            Legal Info
          </ThemedText>
        </View>
      </View>
    </View>
  );
};
