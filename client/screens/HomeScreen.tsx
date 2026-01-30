import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
  interpolateColor,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ItemChip } from "@/components/ItemChip";
import { SegmentedControl } from "@/components/SegmentedControl";
import { NumberInput } from "@/components/NumberInput";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useTheme } from "@/hooks/useTheme";
import { useRaffle } from "@/context/RaffleContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { addToHistory } = useRaffle();
  const { settings } = useSettings();

  const [mode, setMode] = useState<"list" | "number">("list");
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [winnersCount, setWinnersCount] = useState(1);
  const [allowRepetition, setAllowRepetition] = useState(false);
  const [orderedMode, setOrderedMode] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseGlow = useSharedValue(0);
  const shimmerPosition = useSharedValue(0);

  const canDraw =
    mode === "list"
      ? items.length > 0 && (orderedMode || allowRepetition || items.length >= winnersCount)
      : maxNumber >= minNumber &&
        (orderedMode || allowRepetition || maxNumber - minNumber + 1 >= winnersCount);

  useEffect(() => {
    if (canDraw && settings.animationsEnabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      pulseGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
      shimmerPosition.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    } else {
      pulseScale.value = withSpring(1);
      pulseGlow.value = withTiming(0);
    }
  }, [canDraw, settings.animationsEnabled]);

  const drawButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const drawButtonGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseGlow.value * 0.4,
    transform: [{ scale: 1 + pulseGlow.value * 0.1 }],
  }));

  const parseItems = useCallback((text: string) => {
    const parsed = text
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return [...new Set(parsed)];
  }, []);

  const handleAddItems = useCallback(() => {
    const newItems = parseItems(inputText);
    if (newItems.length > 0) {
      setItems((prev) => [...new Set([...prev, ...newItems])]);
      setInputText("");
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [inputText, parseItems, settings.soundEnabled]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        const newItems = parseItems(text);
        if (newItems.length > 0) {
          setItems((prev) => [...new Set([...prev, ...newItems])]);
          if (settings.soundEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      }
    } catch (error) {
      console.error("Failed to paste:", error);
    }
  }, [parseItems, settings.soundEnabled]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [settings.soundEnabled]
  );

  const handleClearAll = useCallback(() => {
    setItems([]);
    setInputText("");
    if (settings.soundEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [settings.soundEnabled]);

  const handleImport = useCallback(() => {
    navigation.navigate("ImportData", {
      onImport: (importedItems: string[]) => {
        setItems((prev) => [...new Set([...prev, ...importedItems])]);
      },
    });
  }, [navigation]);

  const performDraw = useCallback(() => {
    if (!canDraw) return;

    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    let results: string[] = [];
    let pool: string[] = [];

    if (mode === "list") {
      pool = [...items];
    } else {
      for (let i = minNumber; i <= maxNumber; i++) {
        pool.push(i.toString());
      }
    }

    // Se o modo de ranking (orderedMode) estiver ativado, sorteamos todos os itens da lista
    const finalWinnersCount = orderedMode ? pool.length : winnersCount;

    for (let i = 0; i < finalWinnersCount; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      results.push(pool[randomIndex]);
      if (!allowRepetition) {
        pool.splice(randomIndex, 1);
      }
    }

    addToHistory({
      type: mode,
      items: mode === "list" ? items : [],
      minNumber: mode === "number" ? minNumber : undefined,
      maxNumber: mode === "number" ? maxNumber : undefined,
      winnersCount: finalWinnersCount,
      allowRepetition,
      results,
    });

    navigation.navigate("DrawResult", { results, type: mode, orderedMode });
  }, [
    canDraw,
    mode,
    items,
    minNumber,
    maxNumber,
    winnersCount,
    allowRepetition,
    orderedMode,
    addToHistory,
    navigation,
    settings.soundEnabled,
  ]);

  const hasItems = items.length > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SegmentedControl
            options={["Lista", "Números"]}
            selectedIndex={mode === "list" ? 0 : 1}
            onChange={(index) => setMode(index === 0 ? "list" : "number")}
          />
        </Animated.View>

        {mode === "list" ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Card elevation={1} style={styles.inputCard}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Digite itens (um por linha ou vírgula)"
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onSubmitEditing={handleAddItems}
                blurOnSubmit={false}
              />

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.iconButton, { backgroundColor: theme.backgroundSecondary }]}
                  onPress={handlePaste}
                >
                  <Feather name="clipboard" size={18} color={theme.link} />
                </Pressable>

                <Pressable
                  style={[styles.iconButton, { backgroundColor: theme.backgroundSecondary }]}
                  onPress={handleImport}
                >
                  <Feather name="upload" size={18} color={theme.link} />
                </Pressable>

                <Pressable
                  style={[styles.addButton, { backgroundColor: theme.link }]}
                  onPress={handleAddItems}
                >
                  <Feather name="plus" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.addButtonText}>
                    Adicionar
                  </ThemedText>
                </Pressable>
              </View>
            </Card>

            {hasItems ? (
              <Card elevation={1} style={styles.itemsCard}>
                <View style={styles.itemsHeader}>
                  <View style={styles.itemsCountBadge}>
                    <ThemedText type="small" style={{ color: theme.link, fontWeight: "700" }}>
                      {items.length}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={{ flex: 1, fontWeight: "600" }}>
                    {items.length === 1 ? "item" : "itens"} na lista
                  </ThemedText>
                  <Pressable onPress={handleClearAll} style={styles.clearButton}>
                    <Feather name="trash-2" size={16} color={theme.error} />
                    <ThemedText type="small" style={{ color: theme.error }}>
                      Limpar
                    </ThemedText>
                  </Pressable>
                </View>
                <View style={styles.chipsContainer}>
                  {items.map((item, index) => (
                    <ItemChip
                      key={`${item}-${index}`}
                      label={item}
                      onRemove={() => handleRemoveItem(index)}
                    />
                  ))}
                </View>
              </Card>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.link + "15" }]}>
                  <Feather name="users" size={40} color={theme.link} />
                </View>
                <ThemedText
                  type="h4"
                  style={[styles.emptyTitle, { color: theme.text }]}
                >
                  Adicione participantes
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  Digite nomes, números ou palavras para começar o sorteio
                </ThemedText>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Card elevation={1} style={styles.numberCard}>
              <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                INTERVALO DE NÚMEROS
              </ThemedText>
              <View style={styles.numberRow}>
                <View style={styles.numberInputWrapper}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                    Mínimo
                  </ThemedText>
                  <NumberInput
                    value={minNumber}
                    onChange={setMinNumber}
                    min={0}
                    max={maxNumber - 1}
                  />
                </View>
                <View style={styles.numberDivider}>
                  <Feather name="arrow-right" size={20} color={theme.textSecondary} />
                </View>
                <View style={styles.numberInputWrapper}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                    Máximo
                  </ThemedText>
                  <NumberInput
                    value={maxNumber}
                    onChange={setMaxNumber}
                    min={minNumber + 1}
                    max={999999}
                  />
                </View>
              </View>
              <View style={[styles.rangeInfoBadge, { backgroundColor: theme.link + "15" }]}>
                <Feather name="hash" size={14} color={theme.link} />
                <ThemedText type="small" style={{ color: theme.link, fontWeight: "600" }}>
                  {maxNumber - minNumber + 1} números possíveis
                </ThemedText>
              </View>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card elevation={1} style={styles.settingsCard}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              CONFIGURAÇÕES DO SORTEIO
            </ThemedText>
            
            {!orderedMode && (
              <View style={styles.settingRow}>
                <View style={styles.settingLabel}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.accent + "15" }]}>
                    <Feather name="award" size={18} color={theme.accent} />
                  </View>
                  <View>
                    <ThemedText style={{ fontWeight: "600" }}>Vencedores</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      Quantidade a sortear
                    </ThemedText>
                  </View>
                </View>
                <NumberInput
                  value={winnersCount}
                  onChange={setWinnersCount}
                  min={1}
                  max={mode === "list" ? Math.max(items.length, 1) : Math.max(maxNumber - minNumber + 1, 1)}
                  compact
                />
              </View>
            )}

            {!orderedMode && <View style={[styles.divider, { backgroundColor: theme.border }]} />}

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.settingIcon, { backgroundColor: theme.success + "15" }]}>
                  <Feather name="repeat" size={18} color={theme.success} />
                </View>
                <View>
                  <ThemedText style={{ fontWeight: "600" }}>Repetição</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Permitir itens repetidos
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch
                value={allowRepetition}
                onValueChange={setAllowRepetition}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <View style={[styles.settingIcon, { backgroundColor: "#8B5CF6" + "15" }]}>
                  <Feather name="list" size={18} color="#8B5CF6" />
                </View>
                <View>
                  <ThemedText style={{ fontWeight: "600" }}>Ranking</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Sortear com posições (1º, 2º, 3º...)
                  </ThemedText>
                </View>
              </View>
              <ToggleSwitch
                value={orderedMode}
                onValueChange={setOrderedMode}
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.drawSection}>
          <View style={styles.drawButtonContainer}>
            <Animated.View
              style={[
                styles.drawButtonGlow,
                { backgroundColor: theme.link },
                drawButtonGlowStyle,
              ]}
            />
            <AnimatedPressable
              style={[
                styles.drawButton,
                {
                  backgroundColor: canDraw ? theme.link : theme.backgroundTertiary,
                },
                drawButtonStyle,
              ]}
              onPress={performDraw}
              disabled={!canDraw}
            >
              <View style={styles.drawButtonContent}>
                <View style={[styles.drawIcon, { backgroundColor: canDraw ? "rgba(255,255,255,0.2)" : "transparent" }]}>
                  <Feather
                    name="shuffle"
                    size={28}
                    color={canDraw ? "#FFFFFF" : theme.textSecondary}
                  />
                </View>
                <ThemedText
                  type="h3"
                  style={[
                    styles.drawButtonText,
                    { color: canDraw ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  Sortear Agora
                </ThemedText>
              </View>
            </AnimatedPressable>
          </View>

          {!canDraw && mode === "list" && items.length > 0 && (
            <View style={[styles.warningBadge, { backgroundColor: theme.warning + "15" }]}>
              <Feather name="alert-circle" size={16} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning, flex: 1 }}>
                Adicione mais itens ou reduza o número de vencedores
              </ThemedText>
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  inputCard: {
    padding: Spacing.lg,
  },
  textInput: {
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.xs,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  itemsCard: {
    padding: Spacing.lg,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  itemsCountBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB15",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.sm,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: "Nunito_700Bold",
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  numberCard: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.md,
  },
  numberInputWrapper: {
    flex: 1,
  },
  numberDivider: {
    paddingBottom: Spacing.md,
  },
  rangeInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  settingsCard: {
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
  settingIcon: {
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
  drawSection: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  drawButtonContainer: {
    position: "relative",
  },
  drawButtonGlow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: -4,
    borderRadius: BorderRadius.md,
  },
  drawButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  drawButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  drawIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  drawButtonText: {
    fontWeight: "700",
    fontFamily: "Nunito_700Bold",
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
});
