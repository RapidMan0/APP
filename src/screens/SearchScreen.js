import { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import { TextInput, ActivityIndicator, Text } from "react-native-paper";
import MovieCard from "../components/MovieCard";
import { searchMovies } from "../services/tmdbService";

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetails", { movieId: movie.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Поиск фильмов..."
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
          <Text style={styles.noResultsText}>Фильмы не найдены</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={() => handleMoviePress(item)} />
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
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  input: {
    backgroundColor: "#fff",
  },
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
    color: "#999",
  },
});

export default SearchScreen;
