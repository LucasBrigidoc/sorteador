import React from "react";
import { View, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const themeOptions = ["Claro", "Escuro", "Sistema"];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { settings, updateTheme, toggleSound, toggleAnimations } = useSettings();

  const themeIndex =
    settings.theme === "light" ? 0 : settings.theme === "dark" ? 1 : 2;

  const handleThemeChange = (index: number) => {
    const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    updateTheme(themes[index]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleAnimations = () => {
    toggleAnimations();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            APARÊNCIA
          </ThemedText>
          <Card elevation={1} style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.link + "15" }]}>
                  <Feather name="sun" size={18} color={theme.link} />
                </View>
                <ThemedText>Tema</ThemedText>
              </View>
            </View>
            <SegmentedControl
              options={themeOptions}
              selectedIndex={themeIndex}
              onChange={handleThemeChange}
              style={styles.themeControl}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            EFEITOS
          </ThemedText>
          <Card elevation={1} style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.accent + "15" }]}>
                  <Feather name="volume-2" size={18} color={theme.accent} />
                </View>
                <View>
                  <ThemedText>Sons</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Feedback sonoro e haptico
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch value={settings.soundEnabled} onValueChange={handleToggleSound} />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.success + "15" }]}>
                  <Feather name="zap" size={18} color={theme.success} />
                </View>
                <View>
                  <ThemedText>Animações</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Animações de transição
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch
                value={settings.animationsEnabled}
                onValueChange={handleToggleAnimations}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SOBRE
          </ThemedText>
          <Card elevation={1} style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.textSecondary + "15" }]}>
                  <Feather name="info" size={18} color={theme.textSecondary} />
                </View>
                <ThemedText>Versão</ThemedText>
              </View>
              <ThemedText style={{ color: theme.textSecondary }}>{appVersion}</ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Sorteio - Sorteador Digital
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Feito com amor
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  card: {
    padding: Spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  themeControl: {
    marginTop: Spacing.md,
  },
  footer: {
    paddingVertical: Spacing["2xl"],
    gap: Spacing.xs,
  },
});
