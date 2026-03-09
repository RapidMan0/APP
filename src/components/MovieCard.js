import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TMDB_IMAGE_BASE_URL } from "../constants/config";

const MovieCard = ({ movie, onPress }) => {
  const { colors } = useTheme();
  const posterUrl = `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;

  return (
    <Card
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => onPress(movie)}
    >
      <Card.Cover
        source={{ uri: posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />
      <Card.Content
        style={[styles.content, { backgroundColor: colors.surface }]}
      >
        <View style={styles.titleContainer}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={[styles.title, { color: colors.onSurface }]}
          >
            {movie.title}
          </Text>
        </View>

        <View
          style={[styles.infoRow, { borderTopColor: colors.outlineVariant }]}
        >
          <View
            style={[styles.ratingBadge, { backgroundColor: colors.primaryContainer }]}
          >
            <View style={styles.ratingContent}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.ratingText, { color: colors.primary }]}>
                {movie.vote_average?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>
          <Text style={[styles.year, { color: colors.onSurfaceVariant }]}>
            {new Date(movie.release_date).getFullYear() || "N/A"}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    // В FlatList используется columnWrapperStyle с justifyContent: 'space-between'
    // поэтому у карточек не должно быть боковых отступов, чтобы они ровно встали в сетку.
    flexBasis: "48%",
    maxWidth: "48%",
    marginBottom: 12,
    elevation: 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  poster: {
    height: 300,
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  titleContainer: {
    minHeight: 44,
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "600",
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  year: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default React.memo(MovieCard);
