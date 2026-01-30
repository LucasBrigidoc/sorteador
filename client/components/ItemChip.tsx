import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ItemChipProps {
  label: string;
  onRemove?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ItemChip({ label, onRemove }: ItemChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onRemove) {
      scale.value = withSpring(0.95, springConfig);
    }
  };

  const handlePressOut = () => {
    if (onRemove) {
      scale.value = withSpring(1, springConfig);
    }
  };

  if (onRemove) {
    return (
      <AnimatedPressable
        onPress={onRemove}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          { backgroundColor: theme.backgroundSecondary },
          animatedStyle,
        ]}
      >
        <ThemedText type="small" style={styles.label} numberOfLines={1}>
          {label}
        </ThemedText>
        <View style={[styles.removeButton, { backgroundColor: theme.textSecondary + "30" }]}>
          <Feather name="x" size={12} color={theme.textSecondary} />
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundSecondary }]}>
      <ThemedText type="small" style={styles.label} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    maxWidth: 200,
  },
  label: {
    flexShrink: 1,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
