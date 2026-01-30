import React from "react";
import { StyleSheet, Pressable, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

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
  const { theme, isDark } = useTheme();
  const { settings } = useSettings();

  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onChange(index);
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? theme.backgroundDefault : theme.backgroundSecondary,
          borderColor: isDark ? "rgba(255,255,255,0.05)" : "transparent",
        }, 
        style
      ]}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Pressable
            key={option}
            style={[
              styles.option,
              isSelected && [
                styles.selectedOption, 
                { 
                  backgroundColor: isDark ? theme.backgroundSecondary : theme.backgroundDefault,
                },
                !isDark && Shadows.small,
              ],
            ]}
            onPress={() => handlePress(index)}
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
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    borderWidth: 1,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {},
  optionText: {
    fontWeight: "500",
  },
  selectedText: {
    fontWeight: "700",
    fontFamily: "Nunito_700Bold",
  },
});
