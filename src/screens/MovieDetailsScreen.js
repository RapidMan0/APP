import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { ActivityIndicator, Text, useTheme, Button } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { getMovieVideos, getPersonDetails, getPersonMovieCredits } from "../services/tmdbService";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TMDB_IMAGE_BASE_URL, TMDB_BACKDROP_URL } from "../constants/config";
import { getMovieDetails } from "../services/tmdbService";
import { useAppTheme } from "../context/ThemeContext";
import TrailerContainer from "../components/TrailerContainer";
import ActorModal from "../components/ActorModal";

const MovieDetailsScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  useAppTheme();
  const { colors } = useTheme();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailer, setTrailer] = useState(null); // will hold first YouTube trailer
  const [actorModalVisible, setActorModalVisible] = useState(false);
  const [actorLoading, setActorLoading] = useState(false);
  const [actorDetails, setActorDetails] = useState(null);
  const [movieCredits, setMovieCredits] = useState([]);
  const [movieCreditsLoading, setMovieCreditsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const { sessionId, accountId, setFavorite, favoriteMovieIds } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation;
    if (favLoading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [favLoading, pulseAnim]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getMovieDetails(movieId);
        setMovie(response.data);

        // load trailer(s) from TMDB videos endpoint
        try {
          const vidRes = await getMovieVideos(movieId);
          const videos = vidRes.data.results || [];

          // Prefer official Trailer, then Teaser, then any YouTube video
          const youTube = videos.filter(
            (v) => (v.site || "").toLowerCase() === "youtube",
          );
          const preferred =
            youTube.find((v) => (v.type || "").toLowerCase() === "trailer") ||
            youTube.find((v) => (v.type || "").toLowerCase() === "teaser") ||
            youTube[0] ||
            null;

          if (preferred) {
            setTrailer(preferred);
          } else {
            // helpful debug when trailer exists on TMDB but not returned
            if (videos.length > 0) {
              console.debug("Videos present but no YouTube preferred found:", videos);
            }
          }
        } catch (err) {
          // don't fail whole screen if trailers are missing
          console.error("Failed to load videos", err);
        }

        // Check if movie is in favorites using the context state
        if (sessionId && accountId && favoriteMovieIds) {
          setIsFavorite(favoriteMovieIds.has(response.data.id));
        }
      } catch (err) {
        setError("Ошибка загрузки деталей фильма");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId, favoriteMovieIds, sessionId, accountId]);

  const openActorModal = async (personId) => {
    try {
      setActorModalVisible(true);
      setActorLoading(true);
      setMovieCreditsLoading(true);
      
      const [personRes, creditsRes] = await Promise.all([
        getPersonDetails(personId),
        getPersonMovieCredits(personId),
      ]);
      
      setActorDetails(personRes.data);
      
      // Sort by popularity and filter out movies with no poster and current movie
      const credits = creditsRes.data.cast || [];
      const sortedCredits = credits
        .filter(movie => movie.poster_path && movie.id !== movieId)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 12); // Limit to 12 movies
      
      setMovieCredits(sortedCredits);
    } catch (err) {
      console.error("Failed to load person details", err);
      setActorDetails(null);
      setMovieCredits([]);
    } finally {
      setActorLoading(false);
      setMovieCreditsLoading(false);
    }
  };

  const closeActorModal = () => {
    setActorModalVisible(false);
    setActorDetails(null);
    setMovieCredits([]);
  };

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
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
        <Text style={[styles.title, { color: colors.onSurface }]}>
          {movie.title}
        </Text>

        <Animated.View style={[styles.favoriteButton, { opacity: pulseAnim }]}>
          <Button
            disabled={favLoading}
            mode={isFavorite ? "contained" : "outlined"}
            onPress={async () => {
              if (!sessionId || !accountId) {
                navigation.navigate("Login");
                return;
              }
              setFavLoading(true);
              try {
                await setFavorite(movie.id, !isFavorite);
                setIsFavorite((v) => !v);
              } catch (err) {
                console.error(err);
              } finally {
                setFavLoading(false);
              }
            }}
            icon={isFavorite ? "heart" : "heart-outline"}
          >
            {isFavorite ? "В избранном" : "Добавить в избранное"}
          </Button>
        </Animated.View>

        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.rating, { color: colors.primary }]}>
              {movie.vote_average?.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.year, { color: colors.onSurfaceVariant }]}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
          {movie.runtime && (
            <Text style={[styles.runtime, { color: colors.onSurfaceVariant }]}>
              {movie.runtime} мин
            </Text>
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
                    color: colors.onSurfaceVariant,
                  },
                ]}
              >
                {genre.name}
              </Text>
            ))}
          </View>
        )}

        {trailer && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Трейлер</Text>
            <TrailerContainer trailer={trailer} />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {movie.overview || "Описание недоступно"}
        </Text>

        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Основной состав
            </Text>
            <FlatList
              data={movie.credits.cast.slice(0, 10)}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item: actor }) => (
                <TouchableOpacity style={styles.castMember} onPress={() => openActorModal(actor.id)}>
                  {actor.profile_path ? (
                    <Image
                      source={{
                        uri: `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`,
                      }}
                      style={styles.castPhoto}
                    />
                  ) : (
                    // show placeholder icon when no photo available
                    <View
                      style={[
                        styles.castPhoto,
                        {
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: colors.onSurfaceVariant + "20", // subtle background
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={32}
                        color={colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                  <Text
                    style={[styles.actorName, { color: colors.onSurface }]}
                    numberOfLines={2}
                  >
                    {actor.name}
                  </Text>
                  <Text
                    style={[
                      styles.characterName,
                      { color: colors.onSurfaceVariant },
                    ]}
                    numberOfLines={1}
                  >
                    {actor.character}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentContainerStyle={styles.castListContent}
            />
            <ActorModal 
              visible={actorModalVisible} 
              loading={actorLoading} 
              actor={actorDetails} 
              onDismiss={closeActorModal}
              movieCredits={movieCredits}
              movieCreditsLoading={movieCreditsLoading}
              navigation={navigation}
            />
          </>
        )}

        {movie.budget > 0 && (
          <View
            style={[styles.statsContainer, { borderTopColor: colors.outline }]}
          >
            <View style={styles.stat}>
              <Text
                style={[styles.statLabel, { color: colors.onSurfaceVariant }]}
              >
                Бюджет
              </Text>
              <Text style={[styles.statValue, { color: colors.onSurface }]}>
                ${(movie.budget / 1000000).toFixed(1)}M
              </Text>
            </View>
            {movie.revenue > 0 && (
              <View style={styles.stat}>
                <Text
                  style={[styles.statLabel, { color: colors.onSurfaceVariant }]}
                >
                  Сборы
                </Text>
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  year: {
    fontSize: 14,
    marginRight: 12,
  },
  runtime: {
    fontSize: 14,
  },
  favoriteButton: {
    marginTop: 8,
    marginBottom: 12,
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
    marginRight: 6, // tighter horizontal gap between actor cards
    alignItems: "center",
    width: 90, // slightly wider to give more room for two lines
  },
  castPhoto: {
    width: 70,
    height: 105,
    borderRadius: 8,
    marginBottom: 8,
  },
  actorName: {
    fontSize: 10, // a tad smaller to fit two lines
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