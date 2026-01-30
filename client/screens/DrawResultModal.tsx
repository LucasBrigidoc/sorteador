import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
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
  withRepeat,
  runOnJS,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  SlideInUp,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/context/SettingsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

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
  shape: "square" | "circle" | "star";
}

const CONFETTI_COLORS = ["#2563EB", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

function generateConfetti(count: number): ConfettiPiece[] {
  const shapes: Array<"square" | "circle" | "star"> = ["square", "circle", "star"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: -50 - Math.random() * 300,
    rotation: Math.random() * 360,
    scale: 0.4 + Math.random() * 0.6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 800,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
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
      withTiming(height + 100, {
        duration: 2500 + Math.random() * 1500,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(piece.x + (Math.random() - 0.5) * 150, { duration: 600 }),
        withTiming(piece.x + (Math.random() - 0.5) * 150, { duration: 600 }),
        withTiming(piece.x + (Math.random() - 0.5) * 150, { duration: 600 }),
        withTiming(piece.x + (Math.random() - 0.5) * 150, { duration: 700 })
      )
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 1080, { duration: 3000 })
    );
    opacity.value = withDelay(2500, withTiming(0, { duration: 500 }));
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

  const shapeStyle = piece.shape === "circle" 
    ? { borderRadius: 6 } 
    : piece.shape === "star" 
      ? { borderRadius: 2, transform: [{ rotate: "45deg" }] }
      : { borderRadius: 2 };

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: piece.color },
        shapeStyle,
        animatedStyle,
      ]}
    />
  );
}

function SpinningSlot({ 
  items, 
  finalValue, 
  onComplete,
  animationsEnabled,
  soundEnabled,
}: { 
  items: string[]; 
  finalValue: string;
  onComplete: () => void;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}) {
  const { theme } = useTheme();
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"spinning" | "slowing" | "stopped">("spinning");
  
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const blur = useSharedValue(10);

  useEffect(() => {
    if (!animationsEnabled) {
      setDisplayItems([finalValue]);
      setPhase("stopped");
      onComplete();
      return;
    }

    const allItems = [...items];
    for (let i = 0; i < 30; i++) {
      allItems.push(items[Math.floor(Math.random() * items.length)]);
    }
    allItems.push(finalValue);
    setDisplayItems(allItems.sort(() => Math.random() - 0.5));

    let index = 0;
    let speed = 40;
    let slowdownStart = allItems.length - 15;

    const spin = () => {
      if (index < allItems.length - 1) {
        setCurrentIndex(index);
        index++;

        if (soundEnabled && index % 2 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (index >= slowdownStart) {
          setPhase("slowing");
          speed = Math.min(speed * 1.3, 400);
          blur.value = withTiming(0, { duration: speed });
        }

        setTimeout(spin, speed);
      } else {
        setPhase("stopped");
        setCurrentIndex(allItems.length - 1);
        
        scale.value = withSequence(
          withTiming(1.15, { duration: 150 }),
          withSpring(1, { damping: 8, stiffness: 100 })
        );
        glowOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0.3, { duration: 500 })
        );
        
        if (soundEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        setTimeout(onComplete, 300);
      }
    };

    setTimeout(spin, 500);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => {
    const blurValue = interpolate(blur.value, [0, 10], [0, 4]);
    return {
      opacity: interpolate(blur.value, [0, 10], [1, 0.7]),
    };
  });

  const currentItem = displayItems[currentIndex] || finalValue;

  return (
    <Animated.View style={[styles.slotContainer, containerStyle]}>
      <Animated.View style={[styles.slotGlow, { backgroundColor: theme.accent }, glowStyle]} />
      <View style={[styles.slotInner, { backgroundColor: theme.backgroundDefault }]}>
        <Animated.Text
          style={[
            styles.slotText,
            { color: phase === "stopped" ? theme.link : theme.text },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {currentItem}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

function PulsingRing() {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulsingRing,
        { borderColor: theme.accent },
        animatedStyle,
      ]}
    />
  );
}

function LoadingDots() {
  const { theme } = useTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 }),
        withDelay(400, withTiming(0, { duration: 0 }))
      ),
      -1
    );
    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withDelay(400, withTiming(0, { duration: 0 }))
        ),
        -1
      )
    );
    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withDelay(400, withTiming(0, { duration: 0 }))
        ),
        -1
      )
    );
  }, []);

  const dotStyle1 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [{ scale: 1 + dot1.value * 0.3 }],
  }));
  const dotStyle2 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [{ scale: 1 + dot2.value * 0.3 }],
  }));
  const dotStyle3 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [{ scale: 1 + dot3.value * 0.3 }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: theme.accent }, dotStyle1]} />
      <Animated.View style={[styles.dot, { backgroundColor: theme.accent }, dotStyle2]} />
      <Animated.View style={[styles.dot, { backgroundColor: theme.accent }, dotStyle3]} />
    </View>
  );
}

export default function DrawResultModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<DrawResultRouteProp>();
  const { theme, isDark } = useTheme();
  const { settings } = useSettings();

  const { results, type, orderedMode, minNumber, maxNumber, items } = route.params;

  const [phase, setPhase] = useState<"intro" | "spinning" | "revealed">("intro");
  const [completedSlots, setCompletedSlots] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const overlayOpacity = useSharedValue(0);
  const introScale = useSharedValue(0.8);

  const allItems = type === "number" 
    ? Array.from({ length: 20 }, () => (Math.floor(Math.random() * ((maxNumber ?? 100) - (minNumber ?? 1) + 1)) + (minNumber ?? 1)).toString())
    : items || results;

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 400 });
    introScale.value = withSpring(1, { damping: 12 });

    const introTimer = setTimeout(() => {
      setPhase("spinning");
    }, settings.animationsEnabled ? 800 : 100);

    return () => clearTimeout(introTimer);
  }, []);

  const handleSlotComplete = () => {
    setCompletedSlots((prev) => {
      const newCount = prev + 1;
      if (newCount >= results.length) {
        setTimeout(() => {
          setPhase("revealed");
          setConfetti(generateConfetti(80));
        }, 200);
      }
      return newCount;
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleShareSecretSanta = async (pair: string) => {
    const [giver, receiver] = pair.split(" ➔ ");
    
    // HTML com duas páginas para evitar revelação acidental e design mais colorido
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            }
            .page {
              height: 100vh;
              width: 100vw;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              position: relative;
              overflow: hidden;
              page-break-after: always;
            }
            .bg-gradient {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: -1;
            }
            /* Capa - Página 1 */
            .page-1 { background-color: #0F172A; color: white; }
            .cover-card {
              background: rgba(30, 41, 59, 0.7);
              backdrop-filter: blur(10px);
              padding: 60px 40px;
              border-radius: 40px;
              text-align: center;
              border: 2px solid #3B82F6;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .icon-box {
              width: 80px;
              height: 80px;
              background: #3B82F6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 30px;
              font-size: 40px;
            }
            .title-main { font-size: 32px; font-weight: 900; margin-bottom: 15px; letter-spacing: 2px; color: #3B82F6; }
            .subtitle { font-size: 18px; color: #94A3B8; margin-bottom: 40px; }
            .scroll-down { font-size: 14px; color: #F59E0B; font-weight: bold; animation: pulse 2s infinite; }
            
            /* Resultado - Página 2 */
            .page-2 { background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; }
            .result-card {
              background: white;
              padding: 60px 40px;
              border-radius: 40px;
              text-align: center;
              width: 80%;
              max-width: 450px;
              box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
            }
            .reveal-text { font-size: 22px; color: #475569; margin-bottom: 20px; }
            .giver-name-big { font-size: 26px; font-weight: bold; color: #0F172A; margin-bottom: 40px; }
            .winner-box {
              background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
              padding: 50px 30px;
              border-radius: 30px;
              color: white;
              box-shadow: 0 20px 40px rgba(37, 99, 235, 0.4);
            }
            .label { font-size: 14px; text-transform: uppercase; letter-spacing: 4px; opacity: 0.8; margin-bottom: 20px; }
            .receiver-name-big { font-size: 52px; font-weight: 900; text-shadow: 0 4px 10px rgba(0,0,0,0.2); }
            .secret-footer { margin-top: 50px; color: #EF4444; font-weight: 800; font-size: 16px; border: 2px dashed #EF4444; padding: 15px; border-radius: 15px; }

            @keyframes pulse {
              0% { transform: translateY(0); opacity: 0.6; }
              50% { transform: translateY(10px); opacity: 1; }
              100% { transform: translateY(0); opacity: 0.6; }
            }
          </style>
        </head>
        <body>
          <!-- Página 1: Capa de Segurança -->
          <div class="page page-1">
            <div class="cover-card">
              <div class="icon-box">🎁</div>
              <div class="title-main">AMIGO SECRETO</div>
              <div class="subtitle">Resultado exclusivo para:<br><strong>${giver}</strong></div>
              <div class="scroll-down">↓ ROLE PARA BAIXO PARA VER ↓</div>
            </div>
          </div>

          <!-- Página 2: O Resultado -->
          <div class="page page-2">
            <div class="result-card">
              <div class="reveal-text">Olá <strong>${giver}</strong>,</div>
              <div class="reveal-text">o seu amigo secreto é...</div>
              <div class="winner-box">
                <div class="label">Você Tirou:</div>
                <div class="receiver-name-big">${receiver}</div>
              </div>
              <div class="secret-footer">
                ⚠️ NÃO MOSTRE ESTA PÁGINA PARA NINGUÉM!
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    try {
      console.log("Gerando PDF para:", giver, "->", receiver);
      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false 
      });
      console.log("PDF gerado em:", uri);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Amigo Secreto de ${giver}`,
          UTI: "com.adobe.pdf"
        });
      } else {
        alert("O compartilhamento não está disponível neste dispositivo.");
      }
    } catch (error) {
      console.error("Erro detalhado ao compartilhar:", error);
      alert("Não foi possível gerar o arquivo. Tente novamente.");
    }
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const introStyle = useAnimatedStyle(() => ({
    transform: [{ scale: introScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: isDark ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.9)" }, overlayStyle]}>
      {phase === "revealed" &&
        confetti.map((piece) => (
          <ConfettiPieceComponent key={piece.id} piece={piece} />
        ))}

      <View style={styles.content}>
        {phase === "intro" && (
          <Animated.View style={[styles.introContainer, introStyle]}>
            <PulsingRing />
            <View style={[styles.introIconContainer, { backgroundColor: theme.link }]}>
              <Feather name="shuffle" size={40} color="#FFFFFF" />
            </View>
            <ThemedText type="h3" style={[styles.introText, { color: "#FFFFFF" }]}>
              Sorteando...
            </ThemedText>
            <LoadingDots />
          </Animated.View>
        )}

        {phase === "spinning" && (
          <View style={styles.spinningContainer}>
            <Animated.View entering={FadeIn.duration(300)}>
              <ThemedText type="h4" style={[styles.spinningTitle, { color: theme.textSecondary }]}>
                {results.length === 1 ? "Sorteando vencedor..." : `Sorteando ${results.length} vencedores...`}
              </ThemedText>
            </Animated.View>
            
            <View style={styles.slotsContainer}>
              {results.map((result, index) => (
                <Animated.View
                  key={index}
                  entering={settings.animationsEnabled ? SlideInUp.delay(index * 150).springify() : undefined}
                >
                  <SpinningSlot
                    items={allItems}
                    finalValue={result}
                    onComplete={handleSlotComplete}
                    animationsEnabled={settings.animationsEnabled}
                    soundEnabled={settings.soundEnabled}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {phase === "revealed" && (
          <Animated.View
            entering={settings.animationsEnabled ? ZoomIn.springify() : undefined}
            style={styles.resultsContainer}
          >
            <Animated.View
              entering={settings.animationsEnabled ? FadeIn.delay(200) : undefined}
              style={styles.resultHeader}
            >
              <View style={[styles.trophyContainer, { backgroundColor: theme.accent + "20" }]}>
                <Feather name={orderedMode ? "bar-chart-2" : "award"} size={48} color={theme.accent} />
              </View>
              <ThemedText type="h2" style={{ color: "#FFFFFF", marginTop: Spacing.lg }}>
                {orderedMode ? "Ranking!" : results.length === 1 ? "Vencedor!" : "Vencedores!"}
              </ThemedText>
              {orderedMode && (
                <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)", marginTop: Spacing.xs }}>
                  Posições sorteadas
                </ThemedText>
              )}
            </Animated.View>

            <ScrollView 
              style={styles.resultsListScroll}
              contentContainerStyle={styles.resultsListContent}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
            >
              {results.map((result, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                const badgeColor = orderedMode 
                  ? isFirst ? "#FFD700" : isSecond ? "#C0C0C0" : isThird ? "#CD7F32" : theme.accent
                  : theme.accent;
                const positionLabel = orderedMode ? `${index + 1}º` : `${index + 1}`;
                
                return (
                  <Animated.View
                    key={`${result}-${index}`}
                    entering={
                      settings.animationsEnabled
                        ? FadeInDown.delay(400 + index * 150).springify()
                        : undefined
                    }
                    style={[
                      styles.resultCard, 
                      { backgroundColor: theme.backgroundDefault },
                      type === "secret_santa" && styles.secretSantaCard,
                    ]}
                  >
                    <View style={[
                      styles.resultBadge, 
                      { backgroundColor: badgeColor },
                    ]}>
                      <ThemedText 
                        type="small" 
                        style={{ color: "#FFFFFF", fontWeight: "700" }}
                      >
                        <Feather name="user" size={14} color="#FFFFFF" />
                      </ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText 
                        type="h3" 
                        style={[styles.resultText, { color: theme.text }]} 
                        numberOfLines={1}
                      >
                        {type === "secret_santa" ? result.split(" ➔ ")[0] : result}
                      </ThemedText>
                    </View>
                    {type === "secret_santa" ? (
                      <Pressable 
                        onPress={() => handleShareSecretSanta(result)}
                        style={[styles.shareButton, { backgroundColor: theme.link + "15" }]}
                      >
                        <ThemedText type="small" style={{ color: theme.link, fontWeight: "600" }}>Compartilhar</ThemedText>
                        <Feather name="share-2" size={16} color={theme.link} />
                      </Pressable>
                    ) : (
                      <Feather 
                        name={orderedMode ? (isFirst ? "award" : isSecond ? "star" : isThird ? "star" : "check") : "star"} 
                        size={20} 
                        color={badgeColor} 
                      />
                    )}
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>


      {phase === "revealed" && (
        <Animated.View
          entering={settings.animationsEnabled ? FadeInDown.delay(1000).springify() : undefined}
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <Pressable
            onPress={handleClose}
            style={[styles.doneButton, { backgroundColor: theme.link }]}
          >
            <Feather name="check" size={20} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: Spacing.sm }}>
              Concluído
            </ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
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
  introContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  introIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  introText: {
    marginTop: Spacing.xl,
    fontFamily: "Nunito_700Bold",
  },
  pulsingRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spinningContainer: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  spinningTitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  slotsContainer: {
    width: "100%",
    gap: Spacing.lg,
  },
  slotContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  slotGlow: {
    position: "absolute",
    width: "110%",
    height: "120%",
    borderRadius: BorderRadius.lg,
    opacity: 0,
  },
  slotInner: {
    width: "100%",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  slotText: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Nunito_700Bold",
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
  trophyContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsListScroll: {
    width: "100%",
    maxHeight: height * 0.5,
  },
  resultsListContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  firstPlaceCard: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  firstPlaceBadge: {
    width: 44,
    height: 44,
  },
  secretSantaCard: {
    paddingVertical: Spacing.md,
    minHeight: 80,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
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
    width: 48,
    height: 48,
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
    flexDirection: "row",
    width: "100%",
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confettiPiece: {
    position: "absolute",
    width: 12,
    height: 12,
  },
});
