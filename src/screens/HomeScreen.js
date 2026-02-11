import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  PanResponder,
} from "react-native";
import MovieCard from "../components/MovieCard";
import { getPopularMovies, getTopRatedMovies } from "../services/tmdbService";

const HomeScreen = ({ navigation }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1); // Добавлено состояние для текущей страницы

  const activeTabRef = useRef("popular");
  const isMountedRef = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;

        // Свайп вправо (dx > 50) - переход на предыдущую таблетку
        if (dx > 50) {
          if (activeTabRef.current === "topRated") {
            setMovies([]);
            setCurrentPage(1);
            setActiveTab("popular");
          }
        }
        // Свайп влево (dx < -50) - переход на следующую таблетку
        else if (dx < -50) {
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

      // Проверяем, что компонент все еще смонтирован и таб не изменился
      if (isMountedRef.current && activeTabRef.current === tab) {
        if (page === 1) {
          setMovies(response.data.results); // Замена, а не добавление для первой страницы
        } else {
          setMovies((prevMovies) => [...prevMovies, ...response.data.results]); // Добавление для последующих страниц
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

  const handleRefresh = () => {
    setRefreshing(true);
    setMovies([]); // Сброс списка фильмов при обновлении
    setCurrentPage(1); // Сброс страницы
    fetchMovies(activeTab, 1);
  };

  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetails", { movieId: movie.id });
  };

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
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Таблетки */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "popular" && styles.activeTab]}
          onPress={() => {
            setActiveTab("popular");
            setCurrentPage(1); // Сброс страницы при смене вкладки
            setMovies([]); // Сброс списка фильмов
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "popular" && styles.activeTabText,
            ]}
          >
            Популярные
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "topRated" && styles.activeTab]}
          onPress={() => {
            setActiveTab("topRated");
            setCurrentPage(1); // Сброс страницы при смене вкладки
            setMovies([]); // Сброс списка фильмов
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "topRated" && styles.activeTabText,
            ]}
          >
            Лучшие
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список фильмов */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore} // Обработчик для загрузки дополнительных фильмов
        onEndReachedThreshold={0.5} // Порог для срабатывания загрузки
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#e50914",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  errorText: {
    color: "#e50914",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
