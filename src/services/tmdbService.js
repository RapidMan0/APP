import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants/config';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'ru-RU',
  },
});

// Получить популярные фильмы
export const getPopularMovies = (page = 1) => {
  return tmdbClient.get('/movie/popular', {
    params: { page },
  });
};

// Получить фильмы в кино (на данный момент)
export const getNowPlayingMovies = (page = 1) => {
  return tmdbClient.get('/movie/now_playing', {
    params: { page },
  });
};

// Получить лучшие рейтинговые фильмы
export const getTopRatedMovies = (page = 1) => {
  return tmdbClient.get('/movie/top_rated', {
    params: { page },
  });
};

// Получить предстоящие фильмы
export const getUpcomingMovies = (page = 1) => {
  return tmdbClient.get('/movie/upcoming', {
    params: { page },
  });
};

// Поиск фильма по названию
export const searchMovies = (query, page = 1) => {
  return tmdbClient.get('/search/movie', {
    params: {
      query,
      page,
    },
  });
};

// Получить детали фильма
export const getMovieDetails = (movieId) => {
  return tmdbClient.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'credits,recommendations',
    },
  });
};

// Получить трейлер фильма
export const getMovieVideos = (movieId) => {
  return tmdbClient.get(`/movie/${movieId}/videos`);
};
