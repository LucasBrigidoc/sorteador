import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import HistoryStackNavigator from "@/navigation/HistoryStackNavigator";
import SettingsStackNavigator from "@/navigation/SettingsStackNavigator";
import { useTheme } from "@/hooks/useTheme";

export type MainTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.link,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Sorteio",
          tabBarLabel: ({ focused, color }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: focused ? "700" : "500", marginTop: 4 }}>
              Sorteio
            </ThemedText>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: theme.link + "15",
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 20,
            } : null}>
              <Feather name="shuffle" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStackNavigator}
        options={{
          title: "Histórico",
          tabBarLabel: ({ focused, color }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: focused ? "700" : "500", marginTop: 4 }}>
              Histórico
            </ThemedText>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: theme.link + "15",
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 20,
            } : null}>
              <Feather name="clock" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: "Ajustes",
          tabBarLabel: ({ focused, color }) => (
            <ThemedText style={{ color, fontSize: 11, fontWeight: focused ? "700" : "500", marginTop: 4 }}>
              Ajustes
            </ThemedText>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? {
              backgroundColor: theme.link + "15",
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 20,
            } : null}>
              <Feather name="settings" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
