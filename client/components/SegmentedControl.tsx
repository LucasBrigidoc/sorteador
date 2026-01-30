import React from "react";
import { StyleSheet, Pressable, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 200,
  overshootClamping: false,
};

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  style,
}: SegmentedControlProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }, style]}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Pressable
            key={option}
            style={[
              styles.option,
              isSelected && [styles.selectedOption, { backgroundColor: theme.backgroundDefault }],
            ]}
            onPress={() => onChange(index)}
          >
            <ThemedText
              type="body"
              style={[
                styles.optionText,
                isSelected && styles.selectedText,
                { color: isSelected ? theme.link : theme.textSecondary },
              ]}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.xs,
    padding: Spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontWeight: "500",
  },
  selectedText: {
    fontWeight: "600",
  },
});
