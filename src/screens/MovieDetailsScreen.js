import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { TMDB_IMAGE_BASE_URL, TMDB_BACKDROP_URL } from '../constants/config';
import { getMovieDetails } from '../services/tmdbService';

const MovieDetailsScreen = ({ route }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getMovieDetails(movieId);
        setMovie(response.data);
      } catch (err) {
        setError('Ошибка загрузки деталей фильма');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_BACKDROP_URL}${movie.backdrop_path}`
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {backdropUrl && (
        <Image
          source={{ uri: backdropUrl }}
          style={styles.backdrop}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.rating}>⭐ {movie.vote_average?.toFixed(1)}</Text>
          <Text style={styles.year}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
          {movie.runtime && <Text style={styles.runtime}>{movie.runtime} мин</Text>}
        </View>

        {movie.genres && movie.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {movie.genres.map((genre) => (
              <Text key={genre.id} style={styles.genre}>
                {genre.name}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Описание недоступно'}
        </Text>

        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Основной состав</Text>
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
                  <Text style={styles.actorName} numberOfLines={1}>
                    {actor.name}
                  </Text>
                  <Text style={styles.characterName} numberOfLines={1}>
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
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Бюджет</Text>
              <Text style={styles.statValue}>
                ${(movie.budget / 1000000).toFixed(1)}M
              </Text>
            </View>
            {movie.revenue > 0 && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Сборы</Text>
                <Text style={styles.statValue}>
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
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    color: '#e50914',
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  runtime: {
    fontSize: 14,
    color: '#666',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  genre: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  overview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  castListContent: {
    paddingRight: 16,
  },
  castMember: {
    marginRight: 12,
    alignItems: 'center',
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
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  characterName: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: '#e50914',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MovieDetailsScreen;