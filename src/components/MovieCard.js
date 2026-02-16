import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { TMDB_IMAGE_BASE_URL } from "../constants/config";

const MovieCard = ({ movie, onPress }) => {
  const { colors } = useTheme();
  const posterUrl = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;

  return (
    <Card style={styles.container} onPress={onPress}>
      <Card.Cover
        source={{ uri: posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />
      <Card.Content style={styles.content}>
        <View style={styles.titleContainer}>
          <Text variant="titleSmall" numberOfLines={2} style={styles.title}>
            {movie.title}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
            </Text>
          </View>
          <Text style={styles.year}>
            {new Date(movie.release_date).getFullYear() || "N/A"}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  poster: {
    height: 300,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  titleContainer: {
    height: 44,
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontWeight: "600",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  ratingBadge: {
    backgroundColor: "rgba(0, 170, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00aaff",
  },
  year: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
});

export default React.memo(MovieCard);
