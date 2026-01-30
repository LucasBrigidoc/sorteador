import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ItemChip } from "@/components/ItemChip";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RaffleDetailRouteProp = RouteProp<RootStackParamList, "RaffleDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RaffleDetailModal() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RaffleDetailRouteProp>();
  const { theme } = useTheme();
  const { settings } = useSettings();

  const { raffle } = route.params;

  const handleShare = useCallback(async () => {
    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const resultText = raffle.results.join(", ");
    const message = `Resultado do Sorteio\n\n${
      raffle.type === "list"
        ? `Lista com ${raffle.items.length} itens`
        : `Números de ${raffle.minNumber} a ${raffle.maxNumber}`
    }\n\nVencedor${raffle.results.length > 1 ? "es" : ""}: ${resultText}\n\nRealizado em: ${formatFullDate(raffle.date)}`;

    try {
      await Share.share({
        message,
        title: "Resultado do Sorteio",
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  }, [raffle, settings.soundEnabled]);

  const handleExportPDF = useCallback(async () => {
    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              color: #111827;
            }
            h1 { color: #2563EB; margin-bottom: 8px; }
            h2 { color: #6B7280; font-weight: normal; font-size: 16px; margin-bottom: 32px; }
            .section { margin-bottom: 24px; }
            .section-title { 
              font-size: 12px; 
              color: #6B7280; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .winner {
              background: #F59E0B15;
              border-left: 4px solid #F59E0B;
              padding: 12px 16px;
              margin-bottom: 8px;
              font-size: 18px;
              font-weight: 600;
            }
            .config-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #E5E7EB;
            }
            .items-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .item {
              background: #F3F4F6;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h1>Resultado do Sorteio</h1>
          <h2>${formatFullDate(raffle.date)}</h2>
          
          <div class="section">
            <div class="section-title">Vencedor${raffle.results.length > 1 ? "es" : ""}</div>
            ${raffle.results.map((r, i) => `<div class="winner">${i + 1}. ${r}</div>`).join("")}
          </div>
          
          <div class="section">
            <div class="section-title">Configurações</div>
            <div class="config-item">
              <span>Tipo</span>
              <span>${raffle.type === "list" ? "Lista" : "Intervalo Numérico"}</span>
            </div>
            ${
              raffle.type === "number"
                ? `<div class="config-item">
                    <span>Intervalo</span>
                    <span>${raffle.minNumber} - ${raffle.maxNumber}</span>
                  </div>`
                : ""
            }
            <div class="config-item">
              <span>Quantidade de vencedores</span>
              <span>${raffle.winnersCount}</span>
            </div>
            <div class="config-item">
              <span>Repetição permitida</span>
              <span>${raffle.allowRepetition ? "Sim" : "Não"}</span>
            </div>
          </div>
          
          ${
            raffle.type === "list" && raffle.items.length > 0
              ? `<div class="section">
                  <div class="section-title">Participantes (${raffle.items.length})</div>
                  <div class="items-list">
                    ${raffle.items.map((item) => `<span class="item">${item}</span>`).join("")}
                  </div>
                </div>`
              : ""
          }
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar Resultado",
          UTI: "com.adobe.pdf",
        });
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  }, [raffle, settings.soundEnabled]);

  const handleRepeat = useCallback(() => {
    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.goBack();
    // Navigate to home and populate with this raffle's settings
    // For now, just go back
  }, [navigation, settings.soundEnabled]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatFullDate(raffle.date)}
          </ThemedText>
        </View>

        <Card elevation={1} style={styles.resultsCard}>
          <View style={styles.resultHeader}>
            <Feather name="award" size={24} color={theme.accent} />
            <ThemedText type="h4">
              {raffle.results.length === 1 ? "Vencedor" : "Vencedores"}
            </ThemedText>
          </View>
          {raffle.results.map((result, index) => (
            <View
              key={`${result}-${index}`}
              style={[styles.resultItem, { borderTopColor: theme.border }]}
            >
              <View style={[styles.resultBadge, { backgroundColor: theme.accent + "20" }]}>
                <ThemedText type="small" style={{ color: theme.accent, fontWeight: "700" }}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={{ color: theme.link }}>
                {result}
              </ThemedText>
            </View>
          ))}
        </Card>

        <Card elevation={1} style={styles.configCard}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            CONFIGURAÇÕES
          </ThemedText>

          <View style={styles.configRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Tipo</ThemedText>
            <ThemedText style={{ fontWeight: "600" }}>
              {raffle.type === "list" ? "Lista" : "Intervalo Numérico"}
            </ThemedText>
          </View>

          {raffle.type === "number" && (
            <View style={styles.configRow}>
              <ThemedText style={{ color: theme.textSecondary }}>Intervalo</ThemedText>
              <ThemedText style={{ fontWeight: "600" }}>
                {raffle.minNumber} - {raffle.maxNumber}
              </ThemedText>
            </View>
          )}

          <View style={styles.configRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Vencedores</ThemedText>
            <ThemedText style={{ fontWeight: "600" }}>{raffle.winnersCount}</ThemedText>
          </View>

          <View style={styles.configRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Repetição</ThemedText>
            <ThemedText style={{ fontWeight: "600" }}>
              {raffle.allowRepetition ? "Permitida" : "Não permitida"}
            </ThemedText>
          </View>
        </Card>

        {raffle.type === "list" && raffle.items.length > 0 && (
          <Card elevation={1} style={styles.participantsCard}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              PARTICIPANTES ({raffle.items.length})
            </ThemedText>
            <View style={styles.chipsContainer}>
              {raffle.items.map((item, index) => (
                <ItemChip key={`${item}-${index}`} label={item} />
              ))}
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, { borderColor: theme.link }]}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color={theme.link} />
            <ThemedText style={{ color: theme.link, fontWeight: "600" }}>
              Compartilhar
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { borderColor: theme.link }]}
            onPress={handleExportPDF}
          >
            <Feather name="file-text" size={20} color={theme.link} />
            <ThemedText style={{ color: theme.link, fontWeight: "600" }}>
              Exportar PDF
            </ThemedText>
          </Pressable>
        </View>
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
  header: {
    alignItems: "center",
  },
  resultsCard: {
    padding: Spacing.lg,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  configCard: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  participantsCard: {
    padding: Spacing.lg,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
});
