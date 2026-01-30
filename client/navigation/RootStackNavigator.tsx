import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DrawResultModal from "@/screens/DrawResultModal";
import RaffleDetailModal from "@/screens/RaffleDetailModal";
import ImportDataModal from "@/screens/ImportDataModal";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { RaffleHistoryItem } from "@/context/RaffleContext";

export type RootStackParamList = {
  Main: undefined;
  DrawResult: {
    results: string[];
    type: "list" | "number";
  };
  RaffleDetail: {
    raffle: RaffleHistoryItem;
  };
  ImportData: {
    onImport: (items: string[]) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrawResult"
        component={DrawResultModal}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="RaffleDetail"
        component={RaffleDetailModal}
        options={{
          presentation: "modal",
          headerTitle: "Detalhes",
        }}
      />
      <Stack.Screen
        name="ImportData"
        component={ImportDataModal}
        options={{
          presentation: "modal",
          headerTitle: "Importar Dados",
        }}
      />
    </Stack.Navigator>
  );
}
