import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider, Appbar } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import MovieDetailsScreen from "./src/screens/MovieDetailsScreen";
import GenresScreen from "./src/screens/GenresScreen";
import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Кастомный header для HomeStack
function HomeHeader({ navigation, title }) {
  const { isDarkMode, toggleTheme } = useAppTheme();
  return (
    <Appbar.Header style={{ height: 56, paddingHorizontal: 12 }} statusBarHeight={0}>
      <Appbar.Content title={title} titleStyle={{ fontSize: 18, fontWeight: "600" }} />
      <Appbar.Action
        icon={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
        onPress={toggleTheme}
        size={28}
      />
    </Appbar.Header>
  );
}

// Кастомный header для SearchStack
function SearchHeader({ navigation, title }) {
  return (
    <Appbar.Header style={{ height: 56, paddingHorizontal: 12 }} statusBarHeight={0}>
      <Appbar.BackAction onPress={() => navigation.goBack()} size={24} />
      <Appbar.Content title={title} titleStyle={{ fontSize: 18, fontWeight: "600" }} />
    </Appbar.Header>
  );
}

function HomeStack() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          header: ({ tintColor }) => (
            <HomeHeader navigation={navigation} title="Movie Space" />
          ),
        })}
      >
        <Stack.Screen
          name="MoviesList"
          component={HomeScreen}
          options={{
            title: "Movie Space",
          }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            header: ({ navigation }) => (
              <SearchHeader navigation={navigation} title="Детали фильма" />
            ),
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function SearchStack() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          header: ({ navigation: navProp }) => (
            <SearchHeader navigation={navigation} title="Поиск фильмов" />
          ),
        })}
      >
        <Stack.Screen
          name="SearchMovies"
          component={SearchScreen}
          options={{
            title: "Поиск фильмов",
          }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            header: ({ navigation }) => (
              <SearchHeader navigation={navigation} title="Детали фильма" />
            ),
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function GenresStack() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          header: ({ navigation: navProp }) => (
            <HomeHeader navigation={navigation} title="Жанры" />
          ),
        })}
      >
        <Stack.Screen
          name="GenresList"
          component={GenresScreen}
          options={{
            title: "Жанры",
          }}
        />
        <Stack.Screen
          name="MovieDetails"
          component={MovieDetailsScreen}
          options={{
            header: ({ navigation }) => (
              <SearchHeader navigation={navigation} title="Детали фильма" />
            ),
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function App() {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#e50914",
            tabBarInactiveTintColor: "#999",
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "movie" : "movie-outline";
              } else if (route.name === "Genres") {
                iconName = focused
                  ? "format-list-bulleted"
                  : "format-list-bulleted-square";
              } else if (route.name === "Search") {
                iconName = "magnify";
              }

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
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
            name="Genres"
            component={GenresStack}
            options={{
              tabBarLabel: "Жанры",
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
    </PaperProvider>
  );
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWithTheme;