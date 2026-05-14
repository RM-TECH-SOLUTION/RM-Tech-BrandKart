import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { width, height } = Dimensions.get("window");

const isLightColor = (color) => {
  if (!color) return false;
  // For rgba colors like "rgba(0,0,0,0.75)"
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      // Calculate brightness (YIQ formula)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    }
  }
  // For hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  return false; // Default to dark
};

const LoginComponent = ({
  identity,
  password,
  setIdentity,
  setPassword,
  onLogin,
  onRegister,
  onSkip,
  loading,
  cmsConfig,
}) => {
  const cardBgColor = cmsConfig?.cardBackgroundColor || "rgba(0,0,0,0.75)";
  const isLightBg = isLightColor(cardBgColor);
  const textColor = isLightBg ? "#000" : "#fff";
  return (
    <View style={styles.container}>
      <Image
        source={
          cmsConfig?.backgroundImage
            ? { uri: cmsConfig.backgroundImage }
            : require("../assets/bgHome1.png")
        }
        style={styles.background}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                cmsConfig?.cardBackgroundColor ||
                "rgba(0,0,0,0.75)",
            },
          ]}
        >
          <Image
            source={
              cmsConfig?.logoImage
                ? { uri: cmsConfig.logoImage }
                : require("../assets/AR-Fashion.png")
            }
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.title, { color: cmsConfig?.buttonColor || "#E50914" }]}>
                  
            {cmsConfig?.title || "Welcome Back"}
          </Text>

          <Text style={[styles.subtitle, { color: isLightBg ? "#666" : "#ccc" }]}>
            {cmsConfig?.subtitle || "Login to continue"}
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor:
                  cmsConfig?.inputBorderColor ||
                  "#E50914",
              },
            ]}
          >
            <AntDesign name="user" size={18} color={cmsConfig?.inputBorderColor ||
                  "#E50914"} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Email or Phone"
              placeholderTextColor="#999"
              value={identity}
              onChangeText={setIdentity}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor:
                  cmsConfig?.inputBorderColor ||
                  "#E50914",
              },
            ]}
          >
            <AntDesign name="lock" size={18} color={cmsConfig?.inputBorderColor ||
                  "#E50914"} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  cmsConfig?.buttonColor ||
                  "#E50914",
              },
            ]}
            onPress={onLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={
                  cmsConfig?.buttonTextColor ||
                  "#fff"
                }
              />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      cmsConfig?.buttonTextColor ||
                      "#fff",
                  },
                ]}
              >
                Login
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: isLightBg ? "#666" : "#ccc" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text style={[styles.registerText, { color: cmsConfig?.buttonColor || "#E50914" }]}>
                {" "}Register
              </Text>
            </TouchableOpacity>
          </View>

          {cmsConfig?.skipEnabled && (
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={onSkip}
            >
              <Text style={[styles.skipText, { color: cmsConfig?.buttonColor || "#E50914" }]}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default LoginComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    padding: 25,
    borderRadius: 25,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#E50914",
    fontWeight: "bold",
  },
  skipText: {
    color: "#E50914",
    textAlign: "center",
  },
});