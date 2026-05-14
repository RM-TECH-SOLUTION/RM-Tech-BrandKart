import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const LoginComponent2 = ({
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
  const cardBgColor = cmsConfig?.cardBackgroundColor || "rgba(255,255,255,0.95)";
  const isLightBg = isLightColor(cardBgColor);
  const textColor = isLightBg ? "#000" : "#fff";
  return (
    <LinearGradient
      colors={
        cmsConfig?.gradientColors || ["#000", "#333"]
      }
      style={styles.gradientContainer}
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor:
                cmsConfig?.cardBackgroundColor ||
                "rgba(255,255,255,0.95)",
            },
          ]}
        >
          {/* Logo */}
          <Image
            source={
              cmsConfig?.logoImage
                ? { uri: cmsConfig.logoImage }
                : null
            }
            style={styles.logo}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.title,
              { color: cmsConfig?.titleColor || "#000" },
            ]}
          >
            {cmsConfig?.title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  cmsConfig?.subtitleColor || "#555",
              },
            ]}
          >
            {cmsConfig?.subtitle}
          </Text>

          {/* Identity */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  cmsConfig?.inputBackgroundColor ||
                  "#f5f6fa",
              },
            ]}
          >
            <AntDesign
              name="mail"
              size={20}
              color={
                cmsConfig?.inputIconColor ||
                "#007bff"
              }
            />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={
                cmsConfig?.identityPlaceholder ||
                "Email or Phone"
              }
              placeholderTextColor={
                cmsConfig?.placeholderColor ||
                "#999"
              }
              value={identity}
              onChangeText={setIdentity}
            />
          </View>

          {/* Password */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  cmsConfig?.inputBackgroundColor ||
                  "#f5f6fa",
              },
            ]}
          >
            <AntDesign
              name="lock"
              size={20}
              color={
                cmsConfig?.inputIconColor ||
                "#007bff"
              }
            />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder={
                cmsConfig?.passwordPlaceholder ||
                "Password"
              }
              placeholderTextColor={
                cmsConfig?.placeholderColor ||
                "#999"
              }
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  cmsConfig?.buttonColor ||
                  "#000",
              },
            ]}
            onPress={onLogin}
            disabled={loading}
          >
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
              {loading
                ? cmsConfig?.loadingText ||
                  "Loading..."
                : cmsConfig?.buttonText ||
                  "Login"}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.footer}>
            <Text
              style={{
                color:
                  cmsConfig?.footerTextColor ||
                  "#555",
              }}
            >
              {cmsConfig?.footerText}
            </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text
                style={{
                  color:
                    cmsConfig?.registerColor ||
                    "#007bff",
                }}
              >
                {" "}
                {cmsConfig?.registerText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Skip */}
          {cmsConfig?.skipEnabled && (
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={onSkip}
            >
              <Text
                style={{
                  color:
                    cmsConfig?.skipColor ||
                    "red",
                }}
              >
                {cmsConfig?.skipText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

export default LoginComponent2;

const styles = StyleSheet.create({
  gradientContainer: { width, height },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "85%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
  },
});