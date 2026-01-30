import React from "react";
import { StyleSheet, Pressable, View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999999,
  compact = false,
}: NumberInputProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleTextChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    } else if (text === "") {
      onChange(min);
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Pressable
          style={[styles.compactButton, value <= min && styles.disabledButton]}
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <Feather
            name="minus"
            size={16}
            color={value <= min ? theme.textSecondary : theme.text}
          />
        </Pressable>
        <TextInput
          style={[styles.compactInput, { color: theme.text }]}
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Pressable
          style={[styles.compactButton, value >= max && styles.disabledButton]}
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <Feather
            name="plus"
            size={16}
            color={value >= max ? theme.textSecondary : theme.text}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.backgroundSecondary },
          value <= min && styles.disabledButton,
        ]}
        onPress={handleDecrement}
        disabled={value <= min}
      >
        <Feather
          name="minus"
          size={20}
          color={value <= min ? theme.textSecondary : theme.text}
        />
      </Pressable>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value.toString()}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        selectTextOnFocus
      />
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.backgroundSecondary },
          value >= max && styles.disabledButton,
        ]}
        onPress={handleIncrement}
        disabled={value >= max}
      >
        <Feather
          name="plus"
          size={20}
          color={value >= max ? theme.textSecondary : theme.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    height: 44,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    minWidth: 60,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  compactButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  compactInput: {
    width: 40,
    height: 32,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
