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
} from "react-native-paper";
import { getGenres, discoverMoviesByGenre } from "../services/tmdbService";
import MovieCard from "../components/MovieCard";

const GenresScreen = ({ navigation }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    <View style={styles.container}>
      <Text style={styles.header}>Выберите жанр:</Text>
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
                ]}
                onPress={() => handleMoviePress(item.id)}
              >
                <Text
                  style={[
                    styles.genreText,
                    selectedGenreId === item.id && styles.selectedGenreText,
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
        <Text style={styles.selectedLabel}>Фильмы по жанру:</Text>
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
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 16,
    color: "#333",
  },
  genresList: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  genreItem: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e50914",
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
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  genreText: {
    fontSize: 15,
    color: "#e50914",
    fontWeight: "600",
  },
  selectedGenreText: {
    color: "#fff",
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
    marginBottom: 8,
    color: "#333",
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
