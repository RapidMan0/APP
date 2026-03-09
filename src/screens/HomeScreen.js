import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  PanResponder,
} from "react-native";
import { Button, ActivityIndicator, Text, useTheme } from "react-native-paper";
import MovieCard from "../components/MovieCard";
import { getPopularMovies, getTopRatedMovies } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  useAppTheme();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const activeTabRef = useRef("popular");
  const isMountedRef = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 5;
        return isHorizontalSwipe;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx } = gestureState;

        // Свайп вправо (dx > 30) - переход на предыдущую таблетку
        if (dx > 40) {
          if (activeTabRef.current === "topRated") {
            setMovies([]);
            setCurrentPage(1);
            setActiveTab("popular");
          }
        }
        // Свайп влево (dx < -30) - переход на следующую таблетку
        else if (dx < -40) {
          if (activeTabRef.current === "popular") {
            setMovies([]);
            setCurrentPage(1);
            setActiveTab("topRated");
          }
        }
      },
    }),
  ).current;

  // Обновляем ref при изменении activeTab
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Cleanup на unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMovies = async (tab = "popular", page = 1) => {
    try {
      setError(null);
      if (page === 1) {
        setLoading(true);
      }
      let response;

      if (tab === "popular") {
        response = await getPopularMovies(page);
      } else if (tab === "topRated") {
        response = await getTopRatedMovies(page);
      }

      // Фильтруем фильмы: оставляем только с рейтингом > 0
      const filteredResults = response.data.results.filter(
        (movie) => movie.vote_average > 0,
      );

      // Проверяем, что компонент все еще смонтирован и таб не изменился
      if (isMountedRef.current && activeTabRef.current === tab) {
        if (page === 1) {
          setMovies(filteredResults);
        } else {
          // Фильтруем дубликаты при добавлении новых фильмов
          setMovies((prevMovies) => {
            const existingIds = new Set(prevMovies.map((m) => m.id));
            const uniqueNewMovies = filteredResults.filter(
              (movie) => !existingIds.has(movie.id),
            );
            return [...prevMovies, ...uniqueNewMovies];
          });
        }
      }
    } catch (err) {
      setError("Ошибка загрузки фильмов");
      console.error(err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchMovies(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const handleTabPress = (tabName) => {
    if (activeTab === tabName) {
      // Если таб уже активен - делаем рефреш
      handleRefresh();
    } else {
      // Если таб другой - переключаемся
      setActiveTab(tabName);
      setCurrentPage(1);
      setMovies([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setMovies([]); // Сброс списка фильмов при обновлении
    setCurrentPage(1); // Сброс страницы
    fetchMovies(activeTab, 1);
  };

  const handleMoviePress = useCallback(
    (movie) => {
      navigation.navigate("MovieDetails", { movieId: movie.id });
    },
    [navigation],
  );

  const handleLoadMore = () => {
    if (!loading) {
      setCurrentPage((prevPage) => prevPage + 1); // Увеличение номера страницы
    }
  };

  if (loading && currentPage === 1) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#09b2e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      {/* Таблетки */}
      <View
        style={[
          styles.tabsContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outline,
          },
        ]}
      >
        <Button
          mode={activeTab === "popular" ? "contained" : "outlined"}
          onPress={() => handleTabPress("popular")}
          style={styles.tab}
        >
          Популярные
        </Button>

        <Button
          mode={activeTab === "topRated" ? "contained" : "outlined"}
          onPress={() => handleTabPress("topRated")}
          style={styles.tab}
        >
          Лучшие
        </Button>
      </View>

      {/* Список фильмов */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={handleMoviePress} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  tab: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 16,
  },
  errorText: {
    color: "#e50914",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
