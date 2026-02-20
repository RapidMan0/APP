import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

const ThemeContext = createContext();

// Палитра Chatelle
const chatelleColors = {
  50: "#fafafa",
  100: "#f4f3f6",
  200: "#e4e2e9",
  300: "#d4d1db",
  400: "#b3adc0",
  500: "#716a81",
  600: "#524b62",
  700: "#3f394c",
  800: "#27252c",
  900: "#18161d",
  950: "#09070d",
};

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#e50914",
    onPrimary: "#fff",
    primaryContainer: "rgba(229, 9, 20, 0.1)",
    secondary: "#09b2e5",
    onSecondary: "#fff",
    tertiary: "#716a81",
    background: "#fafafa",
    onBackground: "#09070d",
    surface: "#fff",
    onSurface: "#18161d",
    surfaceVariant: "#f4f3f6",
    onSurfaceVariant: "#3f394c",
    outline: "#d4d1db",
    outlineVariant: "#e4e2e9",
    scrim: "rgba(0, 0, 0, 0.12)",
    inverseSurface: "#18161d",
    inverseOnSurface: "#fafafa",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#ff6b7a",
    onPrimary: "#fff",
    primaryContainer: "rgba(255, 107, 122, 0.2)",
    secondary: "#4dd0e1",
    onSecondary: "#000",
    tertiary: "#b3adc0",
    background: "#09070d",
    onBackground: "#f4f3f6",
    surface: "#18161d",
    onSurface: "#f4f3f6",
    surfaceVariant: "#27252c",
    onSurfaceVariant: "#d4d1db",
    outline: "#3f394c",
    outlineVariant: "#524b62",
    scrim: "rgba(0, 0, 0, 0.4)",
    inverseSurface: "#f4f3f6",
    inverseOnSurface: "#09070d",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const THEME_KEY = "theme_is_dark";

  useEffect(() => {
    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(THEME_KEY);
        if (value !== null) {
          setIsDarkMode(value === "true");
        }
      } catch (e) {
        console.error("Failed to load theme:", e);
      }
    };
    load();
  }, []);

  const toggleTheme = async () => {
    try {
      const next = !isDarkMode;
      setIsDarkMode(next);
      await AsyncStorage.setItem(THEME_KEY, next ? "true" : "false");
    } catch (e) {
      console.error("Failed to persist theme:", e);
      setIsDarkMode((prev) => !prev);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
};
