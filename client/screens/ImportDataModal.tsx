import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
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

type ImportDataRouteProp = RouteProp<RootStackParamList, "ImportData">;

export default function ImportDataModal() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<ImportDataRouteProp>();
  const { theme } = useTheme();
  const { settings } = useSettings();

  const { onImport } = route.params;

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePickFile = useCallback(async () => {
    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "text/csv", "text/comma-separated-values"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);
      setError(null);

      const content = await FileSystem.readAsStringAsync(file.uri);

      let items: string[];
      if (file.name.endsWith(".csv")) {
        items = content
          .split(/[\n,]/)
          .map((item) => item.trim().replace(/^["']|["']$/g, ""))
          .filter((item) => item.length > 0);
      } else {
        items = content
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      const uniqueItems = [...new Set(items)];
      setParsedItems(uniqueItems);

      if (settings.soundEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error("Failed to pick file:", err);
      setError("Não foi possível ler o arquivo. Tente novamente.");
      if (settings.soundEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [settings.soundEnabled]);

  const handleImport = useCallback(() => {
    if (parsedItems.length === 0) return;

    if (settings.soundEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onImport(parsedItems);
    navigation.goBack();
  }, [parsedItems, onImport, navigation, settings.soundEnabled]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      setParsedItems((prev) => prev.filter((_, i) => i !== index));
      if (settings.soundEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [settings.soundEnabled]
  );

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
        <Card elevation={1} style={styles.uploadCard}>
          <Pressable style={styles.uploadArea} onPress={handlePickFile}>
            <View
              style={[
                styles.uploadIcon,
                { backgroundColor: theme.link + "15" },
              ]}
            >
              <Feather name="upload-cloud" size={32} color={theme.link} />
            </View>
            <ThemedText type="body" style={{ fontWeight: "600", marginTop: Spacing.md }}>
              {fileName || "Selecionar arquivo"}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              Formatos suportados: .TXT, .CSV
            </ThemedText>
          </Pressable>
        </Card>

        {error && (
          <Card elevation={1} style={[styles.errorCard, { backgroundColor: theme.error + "10" }]}>
            <Feather name="alert-circle" size={20} color={theme.error} />
            <ThemedText style={{ color: theme.error, flex: 1 }}>{error}</ThemedText>
          </Card>
        )}

        {parsedItems.length > 0 && (
          <Card elevation={1} style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Prévia dos itens
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {parsedItems.length} {parsedItems.length === 1 ? "item" : "itens"}
              </ThemedText>
            </View>
            <View style={styles.chipsContainer}>
              {parsedItems.slice(0, 50).map((item, index) => (
                <ItemChip
                  key={`${item}-${index}`}
                  label={item}
                  onRemove={() => handleRemoveItem(index)}
                />
              ))}
              {parsedItems.length > 50 && (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  e mais {parsedItems.length - 50} itens...
                </ThemedText>
              )}
            </View>
          </Card>
        )}

        <Button
          onPress={handleImport}
          disabled={parsedItems.length === 0}
          style={styles.importButton}
        >
          Importar {parsedItems.length > 0 ? `${parsedItems.length} itens` : ""}
        </Button>
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
  uploadCard: {
    padding: Spacing.xl,
  },
  uploadArea: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  previewCard: {
    padding: Spacing.lg,
  },
  previewHeader: {
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
  importButton: {
    marginTop: Spacing.md,
  },
});
