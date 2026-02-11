import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { TMDB_IMAGE_BASE_URL } from "../constants/config";

const MovieCard = ({ movie, onPress }) => {
  const posterUrl = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.rating}>
          ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
        </Text>
        <Text style={styles.year}>
          {new Date(movie.release_date).getFullYear() || "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  poster: {
    width: "100%",
    height: 240,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  year: {
    fontSize: 11,
    color: "#999",
  },
});

export default React.memo(MovieCard);
