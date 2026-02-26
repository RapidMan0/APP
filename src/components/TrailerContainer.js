import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// A simple container that displays a preview thumbnail of a YouTube trailer
// and opens the video when pressed. Accepts a TMDB video object (key/name/etc).
const TrailerContainer = ({ trailer }) => {
  const { colors } = useTheme();
  if (!trailer) {
    return null;
  }

  const url = `https://www.youtube.com/watch?v=${trailer.key}`;
  const thumb = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;

  const open = () => {
    Linking.openURL(url).catch((e) =>
      console.error("Unable to open trailer", e),
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.touchable} onPress={open}>
        <Image
          source={{ uri: thumb }}
          style={styles.image}
          resizeMode="cover"
        />
        <MaterialCommunityIcons
          name="play-circle-outline"
          size={64}
          color="rgba(255,255,255,0.9)"
          style={styles.icon}
        />
      </TouchableOpacity>
      {trailer.name && (
        <Text
          style={[styles.label, { color: colors.onSurface }]}
          numberOfLines={1}
        >
          🔊 {trailer.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  touchable: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  icon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  label: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default TrailerContainer;
