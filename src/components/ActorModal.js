import React from "react";
import { View, Image, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, Text, Button, useTheme, ActivityIndicator } from "react-native-paper";
import { TMDB_IMAGE_BASE_URL } from "../constants/config";

const ActorModal = ({ visible, loading, actor, onDismiss }) => {
  const { colors } = useTheme();

  const translateDepartment = (dept) => {
    if (!dept) return null;
    const d = dept.toLowerCase();
    const map = {
      acting: "Актёрское искусство",
      directing: "Режиссура",
      production: "Продюсирование",
      writing: "Сценарное мастерство",
      editing: "Монтаж",
      camera: "Операторское искусство",
      sound: "Звук",
      art: "Художественное оформление",
      costume: "Костюмы",
    };
    return map[d] || dept.charAt(0).toUpperCase() + dept.slice(1);
  };

  const Label = ({ children }) => (
    <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{children}</Text>
  );
  const Value = ({ children }) => (
    <Text style={[styles.value, { color: colors.onSurface }]}>{children}</Text>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.container, { backgroundColor: colors.surface }]}
      >
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

            {actor?.known_for_department ? (
              <View style={styles.row}>
                <Label>Известность за:</Label>
                <Value>{translateDepartment(actor.known_for_department)}</Value>
              </View>
            ) : null}

            {actor?.birthday ? (
              <View style={styles.row}>
                <Label>Дата рождения:</Label>
                <Value>{actor.birthday}</Value>
              </View>
            ) : null}

            {actor?.place_of_birth ? (
              <View style={styles.row}>
                <Label>Место рождения:</Label>
                <Value>{actor.place_of_birth}</Value>
              </View>
            ) : null}

            <Text style={[styles.biography, { color: colors.onSurfaceVariant }]}>{actor?.biography ? actor.biography.trim() : "Биография отсутствует."}</Text>

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
    paddingBottom: 12,
  },
  center: { height: 200, justifyContent: 'center', alignItems: 'center' },
  photo: { width: 140, height: 200, borderRadius: 8, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', gap: 8, marginBottom: 6 },
  label: { fontSize: 13, width: 120 },
  value: { fontSize: 13, flex: 1 },
  biography: { marginTop: 12, lineHeight: 20, textAlign: 'left' },
});

export default ActorModal;
