import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import MovieDetailsScreen from "./src/screens/MovieDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="MoviesList"
          component={HomeScreen}
          options={{
            title: "Movie Space",
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            title: "Детали фильма",
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function SearchStack() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="SearchMovies"
          component={SearchScreen}
          options={{
            title: "Поиск фильмов",
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            title: "Детали фильма",
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#ff0000",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopColor: "#f0f0f0",
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "film" : "film-outline";
              } else if (route.name === "Search") {
                iconName = focused ? "search" : "search-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarLabel: "Главная",
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchStack}
            options={{
              tabBarLabel: "Поиск",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}