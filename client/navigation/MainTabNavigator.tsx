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
          position: "absolute",
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 12,
          marginHorizontal: 20,
          bottom: 25,
          borderRadius: 25,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
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
              padding: 8,
              borderRadius: 12,
            } : null}>
              <Feather name="shuffle" size={focused ? 22 : 20} color={color} />
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
              padding: 8,
              borderRadius: 12,
            } : null}>
              <Feather name="clock" size={focused ? 22 : 20} color={color} />
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
              padding: 8,
              borderRadius: 12,
            } : null}>
              <Feather name="settings" size={focused ? 22 : 20} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
