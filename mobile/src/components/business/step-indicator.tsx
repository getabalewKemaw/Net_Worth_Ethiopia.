import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
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
    <View style={styles.indicatorContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { backgroundColor: theme.primary }, progressStyle]} />
      </View>
      <View style={styles.stepsRow}>
        <Pressable onPress={onBack} disabled={step === 1} style={styles.stepWrapper}>
          <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.stepCircleText}>1</ThemedText>
          </View>
          <ThemedText style={[styles.stepLabel, { color: theme.text }]}>Core Profile</ThemedText>
        </Pressable>

        <View style={styles.stepWrapper}>
          <View style={[styles.stepCircle, { backgroundColor: step === 2 ? theme.primary : theme.backgroundSelected }]}>
            <ThemedText style={[styles.stepCircleText, step === 1 && { color: theme.textSecondary }]}>2</ThemedText>
          </View>
          <ThemedText style={[styles.stepLabel, { color: step === 2 ? theme.text : theme.textSecondary }]}>
            Legal Info
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    marginVertical: 16,
    position: "relative",
    height: 60,
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    height: 4,
    left: 24,
    right: 24,
    backgroundColor: "#E0E1E6",
    borderRadius: 2,
    top: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  stepWrapper: {
    alignItems: "center",
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  stepCircleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});
