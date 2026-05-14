import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
const LOGO_SIZE = 180;

const SplashScreen = ({
  fadeAnim,
  scaleAnim,
  bgScale,
  backgroundImage,
  logoImage,
}) => {
  return (
    <View style={styles.container}>
      {/* Background */}
      <Animated.Image
        source={backgroundImage}
        style={[
          styles.fullImage,
          {
            opacity: fadeAnim,
            transform: [{ scale: bgScale }],
          },
        ]}
        resizeMode="cover"
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.centerContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={logoImage}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullImage: {
    width: width,
    height: height,
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});