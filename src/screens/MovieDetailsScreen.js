import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
} from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { TMDB_IMAGE_BASE_URL, TMDB_BACKDROP_URL } from "../constants/config";
import { getMovieDetails } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";

const MovieDetailsScreen = ({ route }) => {
  const { movieId } = route.params;
  const { theme } = useAppTheme();
  const { colors } = useTheme();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getMovieDetails(movieId);
        setMovie(response.data);
      } catch (err) {
        setError("Ошибка загрузки деталей фильма");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_BACKDROP_URL}${movie.backdrop_path}`
    : null;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
    >
      {backdropUrl && (
        <Image
          source={{ uri: backdropUrl }}
          style={styles.backdrop}
          resizeMode="cover"
        />
      )}

      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{movie.title}</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.rating, { color: colors.primary }]}>⭐ {movie.vote_average?.toFixed(1)}</Text>
          <Text style={[styles.year, { color: colors.onSurfaceVariant }]}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
          {movie.runtime && (
            <Text style={[styles.runtime, { color: colors.onSurfaceVariant }]}>{movie.runtime} мин</Text>
          )}
        </View>

        {movie.genres && movie.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {movie.genres.map((genre) => (
              <Text 
                key={genre.id} 
                style={[
                  styles.genre, 
                  { 
                    backgroundColor: colors.primaryContainer,
                    color: colors.onSurfaceVariant
                  }
                ]}
              >
                {genre.name}
              </Text>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Описание</Text>
        <Text style={[styles.overview, { color: colors.onSurfaceVariant }]}>
          {movie.overview || "Описание недоступно"}
        </Text>

        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Основной состав</Text>
            <FlatList
              data={movie.credits.cast.slice(0, 10)}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item: actor }) => (
                <View style={styles.castMember}>
                  {actor.profile_path && (
                    <Image
                      source={{
                        uri: `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`,
                      }}
                      style={styles.castPhoto}
                    />
                  )}
                  <Text style={[styles.actorName, { color: colors.onSurface }]} numberOfLines={1}>
                    {actor.name}
                  </Text>
                  <Text style={[styles.characterName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                    {actor.character}
                  </Text>
                </View>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentContainerStyle={styles.castListContent}
            />
          </>
        )}

        {movie.budget > 0 && (
          <View style={[styles.statsContainer, { borderTopColor: colors.outline }]}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Бюджет</Text>
              <Text style={[styles.statValue, { color: colors.onSurface }]}>
                ${(movie.budget / 1000000).toFixed(1)}M
              </Text>
            </View>
            {movie.revenue > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Сборы</Text>
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  ${(movie.revenue / 1000000).toFixed(1)}M
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  year: {
    fontSize: 14,
    marginRight: 12,
  },
  runtime: {
    fontSize: 14,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    alignItems: "center",
    gap: 8,
  },
  genre: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
  },
  castListContent: {
    paddingRight: 16,
  },
  castMember: {
    marginRight: 12,
    alignItems: "center",
    width: 80,
  },
  castPhoto: {
    width: 70,
    height: 105,
    borderRadius: 8,
    marginBottom: 8,
  },
  actorName: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  characterName: {
    fontSize: 10,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e50914",
    fontSize: 16,
    textAlign: "center",
  },
});

export default MovieDetailsScreen;
