import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      navigation.goBack();
    } else {
      // Prefer message returned from login, fall back to generic
      setError(res.message || "Ошибка входа. Проверьте логин/пароль.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.form, { backgroundColor: colors.surface }]}>
        <TextInput
          label="Имя пользователя TMDB"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 12 }} />
        ) : (
          <Button
            mode="contained"
            onPress={handleLogin}
            style={{ marginTop: 12 }}
          >
            Войти
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  form: {
    padding: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: "#e50914",
    marginBottom: 8,
  },
});

export default LoginScreen;
