import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  TextInput,
  ActivityIndicator,
  Text,
  useTheme,
} from "react-native-paper";
import MovieCard from "../components/MovieCard";
import { searchMovies } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  useAppTheme();
  const { colors } = useTheme();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setMovies([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchMovies(query);
      // Фильтруем результаты: оставляем только фильмы с рейтингом > 0
      const filteredMovies = response.data.results.filter(
        (movie) => movie.vote_average > 0,
      );
      setMovies(filteredMovies);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = useCallback(
    (movie) => {
      navigation.navigate("MovieDetails", { movieId: movie.id });
    },
    [navigation],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outline,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Поиск фильмов..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
          mode="outlined"
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : searched && movies.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text
            style={[styles.noResultsText, { color: colors.onSurfaceVariant }]}
          >
            Фильмы не найдены
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  input: {},
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  noResultsText: {
    fontSize: 16,
  },
});

export default SearchScreen;
