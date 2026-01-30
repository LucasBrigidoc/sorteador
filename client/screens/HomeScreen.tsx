import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
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
  Easing,
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

  const pulseScale = useSharedValue(1);

  const canDraw =
    mode === "list"
      ? items.length > 0 && (allowRepetition || items.length >= winnersCount)
      : maxNumber >= minNumber &&
        (allowRepetition || maxNumber - minNumber + 1 >= winnersCount);

  React.useEffect(() => {
    if (canDraw) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [canDraw]);

  const drawButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
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

    for (let i = 0; i < winnersCount; i++) {
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
      winnersCount,
      allowRepetition,
      results,
    });

    navigation.navigate("DrawResult", { results, type: mode });
  }, [
    canDraw,
    mode,
    items,
    minNumber,
    maxNumber,
    winnersCount,
    allowRepetition,
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
            paddingBottom: tabBarHeight + Spacing["2xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          options={["Lista", "Números"]}
          selectedIndex={mode === "list" ? 0 : 1}
          onChange={(index) => setMode(index === 0 ? "list" : "number")}
        />

        {mode === "list" ? (
          <View style={styles.section}>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Digite itens (um por linha ou separados por vírgula)"
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onSubmitEditing={handleAddItems}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.secondaryButton, { borderColor: theme.link }]}
                onPress={handlePaste}
              >
                <Feather name="clipboard" size={16} color={theme.link} />
                <ThemedText style={[styles.secondaryButtonText, { color: theme.link }]}>
                  Colar
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, { borderColor: theme.link }]}
                onPress={handleImport}
              >
                <Feather name="upload" size={16} color={theme.link} />
                <ThemedText style={[styles.secondaryButtonText, { color: theme.link }]}>
                  Importar
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.primarySmallButton, { backgroundColor: theme.link }]}
                onPress={handleAddItems}
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
                <ThemedText style={[styles.secondaryButtonText, { color: "#FFFFFF" }]}>
                  Adicionar
                </ThemedText>
              </Pressable>
            </View>

            {hasItems ? (
              <Card elevation={1} style={styles.itemsCard}>
                <View style={styles.itemsHeader}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </ThemedText>
                  <Pressable onPress={handleClearAll}>
                    <ThemedText type="small" style={{ color: theme.error }}>
                      Limpar tudo
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
                <Image
                  source={require("../../assets/images/empty-raffle.png")}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <ThemedText
                  type="body"
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  Adicione itens para iniciar seu sorteio
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Card elevation={1} style={styles.numberCard}>
              <View style={styles.numberRow}>
                <View style={styles.numberInputWrapper}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
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
                  <ThemedText style={{ color: theme.textSecondary }}>até</ThemedText>
                </View>
                <View style={styles.numberInputWrapper}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
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
              <ThemedText
                type="small"
                style={[styles.rangeInfo, { color: theme.textSecondary }]}
              >
                {maxNumber - minNumber + 1} números possíveis
              </ThemedText>
            </Card>
          </View>
        )}

        <Card elevation={1} style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Feather name="award" size={20} color={theme.link} />
              <ThemedText style={styles.settingText}>Quantidade de vencedores</ThemedText>
            </View>
            <NumberInput
              value={winnersCount}
              onChange={setWinnersCount}
              min={1}
              max={10}
              compact
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Feather name="repeat" size={20} color={theme.link} />
              <ThemedText style={styles.settingText}>Permitir repetição</ThemedText>
            </View>
            <ToggleSwitch
              value={allowRepetition}
              onValueChange={setAllowRepetition}
            />
          </View>
        </Card>

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
          <Feather
            name="shuffle"
            size={24}
            color={canDraw ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            type="h4"
            style={[
              styles.drawButtonText,
              { color: canDraw ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Sortear
          </ThemedText>
        </AnimatedPressable>

        {!canDraw && mode === "list" && items.length > 0 && (
          <ThemedText
            type="small"
            style={[styles.warningText, { color: theme.warning }]}
          >
            Adicione mais itens ou reduza o número de vencedores
          </ThemedText>
        )}
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
  inputRow: {
    gap: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
  },
  primarySmallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemsCard: {
    padding: Spacing.lg,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.lg,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
  },
  numberCard: {
    padding: Spacing.lg,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.md,
  },
  numberInputWrapper: {
    flex: 1,
    gap: Spacing.xs,
  },
  numberDivider: {
    paddingBottom: Spacing.md,
  },
  rangeInfo: {
    marginTop: Spacing.md,
    textAlign: "center",
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
  settingText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  drawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  drawButtonText: {
    fontWeight: "700",
  },
  warningText: {
    textAlign: "center",
  },
});
