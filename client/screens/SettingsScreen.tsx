import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const themeOptions = ["Claro", "Escuro", "Auto"];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
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
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            APARÊNCIA
          </ThemedText>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.cardBackground,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
              !isDark && Shadows.small,
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.link + "15" }]}>
                  <Feather name="moon" size={18} color={theme.link} />
                </View>
                <ThemedText style={{ fontWeight: "600" }}>Tema do App</ThemedText>
              </View>
            </View>
            <SegmentedControl
              options={themeOptions}
              selectedIndex={themeIndex}
              onChange={handleThemeChange}
              style={styles.themeControl}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            EFEITOS E FEEDBACK
          </ThemedText>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.cardBackground,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
              !isDark && Shadows.small,
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.accent + "15" }]}>
                  <Feather name="smartphone" size={18} color={theme.accent} />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={{ fontWeight: "600" }}>Vibração</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Feedback tátil nas ações
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch value={settings.soundEnabled} onValueChange={handleToggleSound} />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.success + "15" }]}>
                  <Feather name="play-circle" size={18} color={theme.success} />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={{ fontWeight: "600" }}>Animações</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Transições e efeitos visuais
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch
                value={settings.animationsEnabled}
                onValueChange={handleToggleAnimations}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            INFORMAÇÕES
          </ThemedText>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.cardBackground,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
              !isDark && Shadows.small,
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.textSecondary + "15" }]}>
                  <Feather name="info" size={18} color={theme.textSecondary} />
                </View>
                <ThemedText style={{ fontWeight: "600" }}>Versão</ThemedText>
              </View>
              <View style={[styles.versionBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  v{appVersion}
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.footer}>
          <View style={[styles.logoContainer, { backgroundColor: theme.link + "10" }]}>
            <Feather name="shuffle" size={24} color={theme.link} />
          </View>
          <ThemedText type="body" style={[styles.footerTitle, { fontFamily: "Nunito_700Bold" }]}>
            Sorteio
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Sorteador digital simples, justo e transparente
          </ThemedText>
        </Animated.View>
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
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
  settingTextContainer: {
    flex: 1,
    gap: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  themeControl: {
    marginTop: Spacing.lg,
  },
  versionBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.sm,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  footerTitle: {
    fontSize: 20,
  },
});
