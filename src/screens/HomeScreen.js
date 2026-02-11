import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
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

  const fetchMovies = async (tab = "popular", page = 1) => {
    try {
      setError(null);
      setLoading(true);
      let response;

      if (tab === "popular") {
        response = await getPopularMovies(page);
      } else if (tab === "topRated") {
        response = await getTopRatedMovies(page);
      }

      setMovies((prevMovies) => [...prevMovies, ...response.data.results]); // Обновление списка фильмов
    } catch (err) {
      setError("Ошибка загрузки фильмов");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    <View style={styles.container}>
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
            style={[styles.tabText, activeTab === "popular" && styles.activeTabText]}
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
            style={[styles.tabText, activeTab === "topRated" && styles.activeTabText]}
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