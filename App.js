import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme, Appbar } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import MovieDetailsScreen from "./src/screens/MovieDetailsScreen";
import GenresScreen from "./src/screens/GenresScreen";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#e50914",
    secondary: "#09b2e5",
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Кастомный header для HomeStack
function HomeHeader({ navigation, title }) {
  return (
    <Appbar.Header>
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

// Кастомный header для SearchStack
function SearchHeader({ navigation, title }) {
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

function HomeStack() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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

export default function App() {
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
              backgroundColor: "#fff",
              borderTopColor: "#f0f0f0",
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "movie" : "movie-outline";
              } else if (route.name === "Genres") {
                iconName = focused ? "format-list-bulleted" : "format-list-bulleted-square";
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
