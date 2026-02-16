import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  ActivityIndicator,
  Text,
  useTheme,
} from "react-native-paper";
import { getGenres, discoverMoviesByGenre } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";
import MovieCard from "../components/MovieCard";

const GenresScreen = ({ navigation }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useAppTheme();
  const { colors } = useTheme();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response.data.genres);
      } catch (err) {
        setError("Ошибка загрузки жанров");
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (selectedGenreId) {
      setLoadingMovies(true);
      setError(null);
      setCurrentPage(1);
      setMovies([]);
      discoverMoviesByGenre(selectedGenreId, 1)
        .then((response) => {
          setMovies(response.data.results);
        })
        .catch(() => {
          setError("Ошибка загрузки фильмов по жанру");
        })
        .finally(() => {
          setLoadingMovies(false);
        });
    } else {
      setMovies([]);
    }
  }, [selectedGenreId]);

  const handleMoviePress = useCallback((genreId) => {
    setSelectedGenreId(genreId);
    setLoadingMovies(true);
    setError(null);
    setCurrentPage(1);
    setMovies([]);

    discoverMoviesByGenre(genreId, 1)
      .then((response) => {
        // Фильтруем фильмы с нулевым рейтингом
        const filteredMovies = response.data.results.filter(
          (movie) => movie.vote_average > 0
        );
        setMovies(filteredMovies);
      })
      .catch(() => {
        setError("Ошибка загрузки фильмов по жанру");
      })
      .finally(() => {
        setLoadingMovies(false);
      });
  }, []);

  const handleMovieCardPress = useCallback((movie) => {
    navigation.navigate("MovieDetails", { movieId: movie.id });
  }, [navigation]);

  const handleLoadMore = () => {
    if (!loadingMovies && selectedGenreId) {
      setLoadingMovies(true);
      const nextPage = currentPage + 1;
      discoverMoviesByGenre(selectedGenreId, nextPage)
        .then((response) => {
          setMovies((prevMovies) => [
            ...prevMovies,
            ...response.data.results,
          ]);
          setCurrentPage(nextPage);
        })
        .catch(() => {
          setError("Ошибка загрузки дополнительных фильмов");
        })
        .finally(() => {
          setLoadingMovies(false);
        });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.onSurface }]}>Выберите жанр:</Text>
      {loadingGenres ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ minHeight: 56, marginBottom: 16 }}>
          <FlatList
            data={genres}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.genreItem,
                  selectedGenreId === item.id && styles.selectedGenre,
                  {
                    backgroundColor: selectedGenreId === item.id ? colors.primary : colors.surface,
                    borderColor: colors.primary,
                  }
                ]}
                onPress={() => handleMoviePress(item.id)}
              >
                <Text
                  style={[
                    styles.genreText,
                    selectedGenreId === item.id && styles.selectedGenreText,
                    {
                      color: selectedGenreId === item.id ? '#fff' : colors.primary,
                    }
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.genresList}
          />
        </View>
      )}
      {selectedGenreId && (
        <Text style={[styles.selectedLabel, { color: colors.onSurface }]}>Фильмы по жанру:</Text>
      )}
      {error && !loadingMovies && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {movies.length === 0 && selectedGenreId && !loadingMovies ? (
        <Text style={styles.errorText}>Нет фильмов для выбранного жанра</Text>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={handleMovieCardPress}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMovies ? (
              <ActivityIndicator
                size="large"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 16,
  },
  genresList: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  genreItem: {
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedGenre: {
  },
  genreText: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedGenreText: {
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  errorText: {
    color: "#e50914",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default GenresScreen;
