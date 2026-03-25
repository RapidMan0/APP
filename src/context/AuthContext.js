import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createRequestToken,
  validateRequestToken,
  createSession,
  getAccountDetails,
  markAsFavorite,
  getAccountFavoriteMovies,
} from "../services/tmdbService";

const SESSION_KEY = "tmdb_session_id";
const ACCOUNT_KEY = "tmdb_account_id";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [favoritesUpdatedAt, setFavoritesUpdatedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoriteMovieIds, setFavoriteMovieIds] = useState(new Set());

  // Load favorite movies when session is restored
  useEffect(() => {
    const loadFavorites = async () => {
      if (!sessionId || !accountId) return;
      try {
        const ids = new Set();
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const res = await getAccountFavoriteMovies(accountId, sessionId, page);
          const results = res.data.results || [];
          results.forEach((movie) => ids.add(movie.id));
          
          hasMore = res.data.page < res.data.total_pages;
          page++;
        }
        
        setFavoriteMovieIds(ids);
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    };
    
    loadFavorites();
  }, [sessionId, accountId]);

  useEffect(() => {
    const restore = async () => {
      try {
        const s = await AsyncStorage.getItem(SESSION_KEY);
        const a = await AsyncStorage.getItem(ACCOUNT_KEY);
        if (s) setSessionId(s);
        if (a) setAccountId(a);
      } catch (err) {
        console.error("Error restoring auth:", err);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      return { success: false, message: "Введите имя пользователя и пароль" };
    }

    // 1. Create request token
    let requestToken;
    try {
      const tokenRes = await createRequestToken();
      requestToken = tokenRes.data.request_token;
    } catch (err) {
      console.error("Login: failed to create request token", err?.message || err);
      return { success: false, message: "Ошибка сети. Попробуйте ещё раз." };
    }

    // 2. Validate with login
    try {
      await validateRequestToken(username, password, requestToken);
    } catch (err) {
      // Axios 401 when credentials are incorrect
      const status = err?.response?.status;
      if (status === 401) {
        return { success: false, message: "Неверный логин или пароль" };
      }
      console.error("Login: validation error", err?.message || err);
      return { success: false, message: "Ошибка при проверке учётных данных" };
    }

    // 3. Create session
    let newSessionId;
    try {
      const sessionRes = await createSession(requestToken);
      newSessionId = sessionRes.data.session_id;
    } catch (err) {
      console.error("Login: failed to create session", err?.message || err);
      return { success: false, message: "Не удалось создать сессию" };
    }

    // 4. Get account details
    let accId;
    try {
      const accountRes = await getAccountDetails(newSessionId);
      accId = accountRes.data.id;
    } catch (err) {
      console.error("Login: failed to get account details", err?.message || err);
      return { success: false, message: "Не удалось получить данные аккаунта" };
    }

    // Persist
    try {
      await AsyncStorage.setItem(SESSION_KEY, newSessionId);
      await AsyncStorage.setItem(ACCOUNT_KEY, accId.toString());
    } catch (err) {
      console.error("Login: failed to persist session", err?.message || err);
    }

    setSessionId(newSessionId);
    setAccountId(accId.toString());
    return { success: true };
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(ACCOUNT_KEY);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setSessionId(null);
    setAccountId(null);
    setFavoritesUpdatedAt(0);
    setFavoriteMovieIds(new Set());
  };

  const setFavorite = async (movieId, favorite = true) => {
    if (!sessionId || !accountId) {
      throw new Error("Not authenticated");
    }
    const res = await markAsFavorite(accountId, sessionId, movieId, favorite);
    
    // Update local favorite IDs immediately
    setFavoriteMovieIds((prev) => {
      const updated = new Set(prev);
      if (favorite) {
        updated.add(movieId);
      } else {
        updated.delete(movieId);
      }
      return updated;
    });
    
    // update timestamp so listeners can refetch favorites
    try {
      setFavoritesUpdatedAt(Date.now());
    } catch (e) {}
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        sessionId,
        accountId,
        loading,
        login,
        logout,
        setFavorite,
        favoritesUpdatedAt,
        favoriteMovieIds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
