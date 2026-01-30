import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useRaffle, RaffleHistoryItem } from "@/context/RaffleContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje, ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Ontem, ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { history, clearHistory } = useRaffle();
  const { settings } = useSettings();

  const handleClearHistory = useCallback(() => {
    if (settings.soundEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    clearHistory();
  }, [clearHistory, settings.soundEnabled]);

  const handleItemPress = useCallback(
    (item: RaffleHistoryItem) => {
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigation.navigate("RaffleDetail", { raffle: item });
    },
    [navigation, settings.soundEnabled]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RaffleHistoryItem; index: number }) => {
      const typeLabel =
        item.type === "list"
          ? `${item.items.length} participantes`
          : `${item.minNumber} - ${item.maxNumber}`;

      const resultsPreview =
        item.results.length > 2
          ? `${item.results.slice(0, 2).join(", ")} +${item.results.length - 2}`
          : item.results.join(", ");

      return (
        <Animated.View
          entering={settings.animationsEnabled ? FadeInDown.delay(index * 50).springify() : undefined}
        >
          <Pressable
            onPress={() => handleItemPress(item)}
            style={({ pressed }) => [
              styles.historyCard,
              { 
                backgroundColor: theme.cardBackground,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
              !isDark && Shadows.small,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: theme.link + "15" },
                  ]}
                >
                  <Feather
                    name={item.type === "list" ? "users" : "hash"}
                    size={18}
                    color={theme.link}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {item.type === "list" ? "Sorteio de Lista" : "Sorteio Numérico"}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {typeLabel}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.cardRight}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {formatDate(item.date)}
                </ThemedText>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </View>
            </View>

            <View style={[styles.resultsSection, { backgroundColor: theme.accent + "08" }]}>
              <View style={styles.resultIconContainer}>
                <Feather name="award" size={16} color={theme.accent} />
              </View>
              <View style={styles.resultsInfo}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {item.results.length === 1 ? "Vencedor" : `${item.results.length} vencedores`}
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[styles.resultsText, { color: theme.accent }]}
                  numberOfLines={1}
                >
                  {resultsPreview}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [theme, isDark, handleItemPress, settings.animationsEnabled]
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Image
          source={require("../../assets/images/empty-history.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <ThemedText type="h4" style={[styles.emptyTitle, { fontFamily: "Nunito_700Bold" }]}>
          Nenhum sorteio ainda
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.emptySubtext, { color: theme.textSecondary }]}
        >
          Realize seu primeiro sorteio e ele aparecerá aqui
        </ThemedText>
      </View>
    ),
    [theme]
  );

  const ListHeaderComponent = useCallback(
    () =>
      history.length > 0 ? (
        <Animated.View 
          entering={FadeIn}
          style={styles.listHeader}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.countBadge, { backgroundColor: theme.link + "15" }]}>
              <ThemedText type="small" style={{ color: theme.link, fontWeight: "700" }}>
                {history.length}
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {history.length === 1 ? "sorteio realizado" : "sorteios realizados"}
            </ThemedText>
          </View>
          <Pressable onPress={handleClearHistory} style={styles.clearAllButton}>
            <Feather name="trash-2" size={16} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error }}>
              Limpar
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : null,
    [history.length, theme, handleClearHistory]
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          history.length === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
  historyCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  resultsSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  resultIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsInfo: {
    flex: 1,
    gap: 2,
  },
  resultsText: {
    fontWeight: "700",
    fontFamily: "Nunito_700Bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyImage: {
    width: 160,
    height: 160,
    opacity: 0.75,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
