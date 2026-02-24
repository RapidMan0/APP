import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ActivityIndicator, Text, Button, useTheme } from "react-native-paper";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";
import { getAccountFavoriteMovies } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";

const FavoritesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  useAppTheme();
  const { sessionId, accountId } = useAuth();
  const { favoritesUpdatedAt } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFavorites = useCallback(async (p = 1) => {
    if (!sessionId || !accountId) return;
    try {
      setLoading(true);
      const res = await getAccountFavoriteMovies(accountId, sessionId, p);
      const results = res.data.results || [];
      
      if (p === 1) {
        // Удаляем дубликаты на первой странице
        const uniqueMovies = Array.from(
          new Map(results.map((movie) => [movie.id, movie])).values()
        );
        setMovies(uniqueMovies);
      } else {
        // Фильтруем дубликаты при добавлении новых фильмов
        setMovies((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMovies = results.filter(
            (movie) => !existingIds.has(movie.id)
          );
          return [...prev, ...uniqueNewMovies];
        });
      }
      setHasMore(res.data.page < res.data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accountId, sessionId]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    if (sessionId && accountId) fetchFavorites(1);
  }, [sessionId, accountId, fetchFavorites]);

  // Refetch when favorites change elsewhere in app
  useEffect(() => {
    if (sessionId && accountId && favoritesUpdatedAt) {
      setPage(1);
      fetchFavorites(1);
    }
  }, [favoritesUpdatedAt]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchFavorites(next);
  };

  const handleMoviePress = useCallback((movie) => {
    navigation.navigate("MovieDetails", { movieId: movie.id });
  }, [navigation]);

  if (!sessionId || !accountId) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ marginBottom: 12, color: colors.onSurface }}>
          Вы не вошли в аккаунт. Чтобы видеть избранное, войдите в TMDB.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate("Login")}>
          Войти
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && movies.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.onSurface }}>У вас пока нет избранных фильмов</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 5 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default FavoritesScreen;
