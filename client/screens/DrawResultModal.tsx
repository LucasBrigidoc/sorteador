import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type DrawResultRouteProp = RouteProp<RootStackParamList, "DrawResult">;

const { width, height } = Dimensions.get("window");

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

const CONFETTI_COLORS = ["#2563EB", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: -50 - Math.random() * 200,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 500,
  }));
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const translateY = useSharedValue(piece.y);
  const translateX = useSharedValue(piece.x);
  const rotate = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      piece.delay,
      withTiming(height + 50, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(piece.x + (Math.random() - 0.5) * 100, { duration: 500 }),
        withTiming(piece.x + (Math.random() - 0.5) * 100, { duration: 500 }),
        withTiming(piece.x + (Math.random() - 0.5) * 100, { duration: 500 }),
        withTiming(piece.x + (Math.random() - 0.5) * 100, { duration: 500 })
      )
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 720, { duration: 2500 })
    );
    opacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: piece.scale },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: piece.color },
        animatedStyle,
      ]}
    />
  );
}

export default function DrawResultModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<DrawResultRouteProp>();
  const { theme } = useTheme();
  const { settings } = useSettings();

  const { results } = route.params;

  const [phase, setPhase] = useState<"spinning" | "revealed">("spinning");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const spinScale = useSharedValue(1);
  const spinOpacity = useSharedValue(1);

  const spinTexts = useRef<string[]>([]);

  useEffect(() => {
    if (results.length === 0) return;

    const allPossible = [...results];
    for (let i = 0; i < 20; i++) {
      allPossible.push(results[Math.floor(Math.random() * results.length)]);
    }
    spinTexts.current = allPossible.sort(() => Math.random() - 0.5);

    let spinIndex = 0;
    let interval = 50;

    const spin = () => {
      if (spinIndex < spinTexts.current.length && phase === "spinning") {
        setDisplayText(spinTexts.current[spinIndex]);
        spinIndex++;

        if (settings.soundEnabled && spinIndex % 3 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        interval = Math.min(interval * 1.1, 200);

        setTimeout(spin, interval);
      } else {
        setPhase("revealed");
        setDisplayText(results[0]);
        setConfetti(generateConfetti(50));

        if (settings.soundEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    };

    if (settings.animationsEnabled) {
      setTimeout(spin, 300);
    } else {
      setPhase("revealed");
      setDisplayText(results[0]);
      setConfetti(generateConfetti(50));
      if (settings.soundEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [results, settings.animationsEnabled, settings.soundEnabled]);

  const spinningStyle = useAnimatedStyle(() => ({
    transform: [{ scale: spinScale.value }],
    opacity: spinOpacity.value,
  }));

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.overlay }]}>
      {phase === "revealed" &&
        confetti.map((piece) => (
          <ConfettiPieceComponent key={piece.id} piece={piece} />
        ))}

      <View style={styles.content}>
        {phase === "spinning" ? (
          <Animated.View style={[styles.spinningContainer, spinningStyle]}>
            <ThemedText
              type="h1"
              style={[styles.spinningText, { color: "#FFFFFF" }]}
            >
              {displayText}
            </ThemedText>
          </Animated.View>
        ) : (
          <Animated.View
            entering={settings.animationsEnabled ? ZoomIn.springify() : undefined}
            style={styles.resultsContainer}
          >
            <Animated.View
              entering={settings.animationsEnabled ? FadeIn.delay(200) : undefined}
              style={styles.resultHeader}
            >
              <Feather name="award" size={48} color={theme.accent} />
              <ThemedText type="h3" style={{ color: "#FFFFFF", marginTop: Spacing.md }}>
                {results.length === 1 ? "Vencedor!" : "Vencedores!"}
              </ThemedText>
            </Animated.View>

            {results.map((result, index) => (
              <Animated.View
                key={`${result}-${index}`}
                entering={
                  settings.animationsEnabled
                    ? FadeInDown.delay(400 + index * 100).springify()
                    : undefined
                }
                style={[styles.resultCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={styles.resultBadge}>
                  <ThemedText type="small" style={{ color: theme.accent, fontWeight: "700" }}>
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText type="h2" style={[styles.resultText, { color: theme.text }]}>
                  {result}
                </ThemedText>
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </View>

      {phase === "revealed" && (
        <Animated.View
          entering={settings.animationsEnabled ? FadeIn.delay(800) : undefined}
          style={[styles.closeButton, { top: insets.top + Spacing.lg }]}
        >
          <Pressable
            onPress={handleClose}
            style={[styles.closeButtonInner, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </Animated.View>
      )}

      {phase === "revealed" && (
        <Animated.View
          entering={settings.animationsEnabled ? FadeInDown.delay(1000).springify() : undefined}
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <Pressable
            onPress={handleClose}
            style={[styles.doneButton, { backgroundColor: theme.link }]}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Concluído
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    width: "100%",
  },
  spinningContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinningText: {
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
  },
  resultsContainer: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F59E0B15",
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    flex: 1,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    right: Spacing.lg,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },
  doneButton: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  confettiPiece: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
