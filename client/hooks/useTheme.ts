import { Colors } from "@/constants/theme";
import { useSettings } from "@/context/SettingsContext";
import { useColorScheme as useDeviceColorScheme } from "react-native";

export function useTheme() {
  const { settings } = useSettings();
  const deviceColorScheme = useDeviceColorScheme();
  
  const colorScheme = settings.theme === "system" 
    ? (deviceColorScheme ?? "light")
    : settings.theme;
    
  const isDark = colorScheme === "dark";
  const theme = Colors[colorScheme];

  return {
    theme,
    isDark,
  };
}
