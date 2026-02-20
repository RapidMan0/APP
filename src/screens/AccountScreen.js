import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, ActivityIndicator, useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { getAccountDetails } from "../services/tmdbService";

const AccountScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { sessionId, accountId, logout } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getAccountDetails(sessionId);
        setAccount(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sessionId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text
            style={{ color: colors.onSurface, fontSize: 18, marginBottom: 8 }}
          >
            {account ? account.username : "Профиль"}
          </Text>
          {account && (
            <Text style={{ color: colors.onSurfaceVariant, marginBottom: 16 }}>
              ID: {account.id}
            </Text>
          )}
          <Button
            mode="contained"
            onPress={async () => {
              await logout();
              navigation.replace("Login");
            }}
          >
            Выйти
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default AccountScreen;
