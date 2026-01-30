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
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useRaffle, RaffleHistoryItem } from "@/context/RaffleContext";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje às ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Ontem às ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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
          ? `Lista (${item.items.length} itens)`
          : `Números (${item.minNumber} - ${item.maxNumber})`;

      const resultsPreview =
        item.results.length > 2
          ? `${item.results.slice(0, 2).join(", ")} e mais ${item.results.length - 2}`
          : item.results.join(", ");

      return (
        <Animated.View
          entering={settings.animationsEnabled ? FadeInDown.delay(index * 50).springify() : undefined}
        >
          <Card
            elevation={1}
            onPress={() => handleItemPress(item)}
            style={styles.historyCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: theme.link + "15" },
                  ]}
                >
                  <Feather
                    name={item.type === "list" ? "list" : "hash"}
                    size={16}
                    color={theme.link}
                  />
                </View>
                <View>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {typeLabel}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {formatDate(item.date)}
                  </ThemedText>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>

            <View style={[styles.resultsSection, { borderTopColor: theme.border }]}>
              <View style={styles.resultLabel}>
                <Feather name="award" size={14} color={theme.accent} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.results.length}{" "}
                  {item.results.length === 1 ? "vencedor" : "vencedores"}
                </ThemedText>
              </View>
              <ThemedText
                type="body"
                style={[styles.resultsText, { color: theme.link }]}
                numberOfLines={1}
              >
                {resultsPreview}
              </ThemedText>
            </View>
          </Card>
        </Animated.View>
      );
    },
    [theme, handleItemPress, settings.animationsEnabled]
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Image
          source={require("../../assets/images/empty-history.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
          Nenhum sorteio ainda
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.emptySubtext, { color: theme.textSecondary }]}
        >
          Seus sorteios aparecerão aqui
        </ThemedText>
      </View>
    ),
    [theme]
  );

  const ListHeaderComponent = useCallback(
    () =>
      history.length > 0 ? (
        <View style={styles.listHeader}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {history.length} {history.length === 1 ? "sorteio" : "sorteios"}
          </ThemedText>
          <Pressable onPress={handleClearHistory}>
            <ThemedText type="small" style={{ color: theme.error }}>
              Limpar tudo
            </ThemedText>
          </Pressable>
        </View>
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
    marginBottom: Spacing.md,
  },
  separator: {
    height: Spacing.md,
  },
  historyCard: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  resultLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  resultsText: {
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },
  emptySubtext: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
