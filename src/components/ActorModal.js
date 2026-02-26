import React from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, Text, Button, useTheme, ActivityIndicator } from "react-native-paper";
import { TMDB_IMAGE_BASE_URL } from "../constants/config";

const ActorModal = ({ visible, loading, actor, onDismiss }) => {
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.container, { backgroundColor: colors.surface }] }>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {actor?.profile_path && (
              <Image source={{ uri: `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` }} style={styles.photo} />
            )}
            <Text style={[styles.name, { color: colors.onSurface }]}>{actor?.name || "—"}</Text>
            {actor?.birthday && (
              <Text style={{ color: colors.onSurfaceVariant }}>Дата рождения: {actor.birthday}</Text>
            )}
            {actor?.place_of_birth && (
              <Text style={{ color: colors.onSurfaceVariant }}>Место рождения: {actor.place_of_birth}</Text>
            )}
            {actor?.known_for_department && (
              <Text style={{ color: colors.onSurfaceVariant }}>Известен как: {actor.known_for_department}</Text>
            )}
            <Text style={[styles.biography, { color: colors.onSurfaceVariant }]}>{actor?.biography || "Биография отсутствует."}</Text>
            <Button mode="contained" onPress={onDismiss} style={{ marginTop: 12 }}>Закрыть</Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%'
  },
  content: {
    alignItems: 'center',
  },
  center: { height: 200, justifyContent: 'center', alignItems: 'center' },
  photo: { width: 140, height: 200, borderRadius: 8, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  biography: { marginTop: 12, lineHeight: 20, textAlign: 'left' },
});

export default ActorModal;
