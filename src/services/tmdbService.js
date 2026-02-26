import axios from "axios";
import { TMDB_API_KEY, TMDB_BASE_URL } from "../constants/config";

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "ru-RU",
  },
});

// Получить популярные фильмы
export const getPopularMovies = (page = 1) => {
  return tmdbClient.get("/movie/popular", {
    params: { page },
  });
};

// Получить фильмы в кино (на данный момент)
export const getNowPlayingMovies = (page = 1) => {
  return tmdbClient.get("/movie/now_playing", {
    params: { page },
  });
};

// Получить лучшие рейтинговые фильмы
export const getTopRatedMovies = (page = 1) => {
  return tmdbClient.get("/movie/top_rated", {
    params: { page },
  });
};

// Получить предстоящие фильмы
export const getUpcomingMovies = (page = 1) => {
  return tmdbClient.get("/movie/upcoming", {
    params: { page },
  });
};

// Поиск фильма по названию
export const searchMovies = (query, page = 1) => {
  return tmdbClient.get("/search/movie", {
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
      append_to_response: "credits,recommendations",
    },
  });
};

// Получить трейлер фильма
export const getMovieVideos = (movieId) => {
  // Request videos in English first to increase chance of getting official trailers
  // (some videos aren't returned when requesting localized `ru-RU`).
  return tmdbClient.get(`/movie/${movieId}/videos`, {
    params: { language: "en-US" },
  });
};

// Получить жанры фильмов
export const getGenres = async () => {
  return await axios.get(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=ru-RU`,
  );
};

// Получить фильмы по жанру
export const discoverMoviesByGenre = async (genreId, page = 1) => {
  return await tmdbClient.get("/discover/movie", {
    params: {
      with_genres: genreId,
      page,
    },
  });
};

// Authentication: create request token
export const createRequestToken = () => {
  return tmdbClient.get("/authentication/token/new");
};

// Validate request token with username/password
export const validateRequestToken = (username, password, requestToken) => {
  return tmdbClient.post(`/authentication/token/validate_with_login`, {
    username,
    password,
    request_token: requestToken,
  });
};

// Create a session from a validated request token
export const createSession = (requestToken) => {
  return tmdbClient.post(`/authentication/session/new`, {
    request_token: requestToken,
  });
};

// Get account details (requires session_id)
export const getAccountDetails = (sessionId) => {
  return tmdbClient.get(`/account`, {
    params: { session_id: sessionId },
  });
};

// Get account favorite movies
export const getAccountFavoriteMovies = (accountId, sessionId, page = 1) => {
  return tmdbClient.get(`/account/${accountId}/favorite/movies`, {
    params: { session_id: sessionId, page },
  });
};

// Mark/unmark movie as favorite (requires session)
export const markAsFavorite = (accountId, sessionId, mediaId, favorite = true) => {
  return tmdbClient.post(
    `/account/${accountId}/favorite`,
    {
      media_type: "movie",
      media_id: mediaId,
      favorite,
    },
    {
      params: { session_id: sessionId },
    },
  );
};
