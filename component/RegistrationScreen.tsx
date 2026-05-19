import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useCmsStore from "../store/useCmsStore";

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

export default function RegistrationScreen({
  onLogin,
  registerUser,
  authError,
  clearAuthError,
}) {
  const { cmsData } = useCmsStore();

  const [cmsConfig, setCmsConfig] = useState({});
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Select Gender");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralCode, setReferralCode] = useState("");

  const inputBorderColor = cmsConfig?.inputBorderColor || "#E50914";

  const cardBgColor = cmsConfig?.cardBackgroundColor || "rgba(0,0,0,0.85)";
  const isLightBg = isLightColor(cardBgColor);
  const textColor = isLightBg ? "#000" : "#fff";

  /* ================= GET CMS ================= */

  useEffect(() => {
    const registerConfig = cmsData?.find(
      (item) => item.modelSlug === "registerConfiguration"
    );

    if (!registerConfig?.cms) return;

    const formatted = Object.keys(registerConfig.cms).reduce((acc, key) => {
      acc[key] = registerConfig.cms[key]?.fieldValue;
      return acc;
    }, {});

    setCmsConfig(formatted);
  }, [cmsData]);

  /* ================= VALIDATION ================= */

  function validate() {
    const e = {};

    if (!name.trim()) e.name = "Name is required";

    if (!phone.trim()) e.phone = "Phone is required";
    else if (!/^\d{7,15}$/.test(phone.trim()))
      e.phone = "Enter valid phone (7–15 digits)";

    if (!email.trim()) e.email = "Email is required";
    else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim())
    )
      e.email = "Enter valid email";

    if (!password.trim()) e.password = "Password is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!validate()) return;

    clearAuthError && clearAuthError();
    setLoading(true);
    try {
      const result = await registerUser(
        name.trim(),
        email.trim(),
        phone.trim(),
        password,
        referralCode.trim() || null,
        gender !== "Select Gender" ? gender : null
      );

      if (!result?.success) {
        return;
      }

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setReferralCode("");
      setGender("Select Gender");
      setErrors({});

      onLogin && onLogin();
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        {/* Background */}
        <Image
          source={
            cmsConfig?.backgroundImage
              ? { uri: cmsConfig.backgroundImage }
              : require("../assets/bgHome1.png")
          }
          style={styles.background}
          resizeMode="cover"
        />

        {/* Overlay */}
        <View style={styles.overlay} />

        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: 40,
          }}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  cmsConfig?.cardBackgroundColor ||
                  "rgba(0,0,0,0.85)",
              },
            ]}
          >
            {/* Logo */}
            <Image
              source={
                cmsConfig?.logoImage
                  ? { uri: cmsConfig.logoImage }
                  : require("../assets/AR-Fashion.png")
              }
              style={styles.logo}
            />

            <Text style={[styles.title, { color: cmsConfig?.buttonColor || "#E50914" }]}>
              {cmsConfig?.title || "Create Account"}
            </Text>

            <Text style={[styles.subtitle, { color: isLightBg ? "#666" : "#ccc" }]}>
              {cmsConfig?.subtitle || "Join us today"}
            </Text>

            {/* Inputs */}
            {[
              {
                label: "Full Name",
                value: name,
                setter: (t) => {
                  clearAuthError && clearAuthError();
                  setName(t);
                },
                key: "name"
              },
              {
                label: "Phone",
                value: phone,
                setter: (t) => {
                  clearAuthError && clearAuthError();
                  setPhone(t.replace(/\D/g, ""));
                },
                key: "phone",
              },
              {
                label: "Email",
                value: email,
                setter: (t) => {
                  clearAuthError && clearAuthError();
                  setEmail(t);
                },
                key: "email"
              },
              {
                label: "Password",
                value: password,
                setter: (t) => {
                  clearAuthError && clearAuthError();
                  setPassword(t);
                },
                key: "password",
                secure: true,
              },
            ].map((field) => (
              <View key={field.key} style={styles.field}>
                <TextInput
                  placeholder={field.label}
                  placeholderTextColor="#999"
                  secureTextEntry={field.secure}
                  value={field.value}
                  onChangeText={field.setter}
                  style={[
                    styles.input,
                    {
                      borderColor: inputBorderColor,
                      color: textColor,
                    },
                    errors[field.key] && styles.inputError,
                  ]}
                />
                {errors[field.key] && (
                  <Text style={styles.errText}>
                    {errors[field.key]}
                  </Text>
                )}
              </View>
            ))}

            {/* Referral */}
            {cmsConfig?.referralEnabled !== false && (
              <View style={styles.field}>
                <TextInput
                  placeholder="Referral Code (Optional)"
                  placeholderTextColor="#999"
                  value={referralCode}
                  onChangeText={(t) => {
                    clearAuthError && clearAuthError();
                    setReferralCode(t.toUpperCase());
                  }
                  }
                  style={[
                    styles.input,
                    {
                      borderColor: inputBorderColor,
                      color: textColor,
                    },
                  ]}
                />
              </View>
            )}

            {/* Gender */}
            {cmsConfig?.genderEnabled && (
              <>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      borderColor:
                        cmsConfig?.inputBorderColor || "#E50914",
                    },
                  ]}
                  onPress={() => setShowGenderModal(true)}
                >
                  <Text style={{ color: gender === "Select Gender" ? "#999" : textColor }}>
                    {gender}
                  </Text>
                </TouchableOpacity>

                <Modal
                  visible={showGenderModal}
                  transparent
                  animationType="fade"
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                      {["Male", "Female", "Other"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={styles.modalOption}
                          onPress={() => {
                            setGender(g);
                            setShowGenderModal(false);
                          }}
                        >
                          <Text style={{ color: "#000" }}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Modal>
              </>
            )}

            {/* Button */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor:
                    cmsConfig?.buttonColor || "#E50914",
                },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={
                    cmsConfig?.buttonTextColor || "#fff"
                  }
                />
              ) : (
                <Text
                  style={{
                    color:
                      cmsConfig?.buttonTextColor || "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {cmsConfig?.buttonText ||
                    "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {!!authError && (
              <Text style={styles.apiErrorText}>{authError}</Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={{ color: isLightBg ? "#666" : "#ccc" }}>
                Already have account?
              </Text>
              <TouchableOpacity onPress={onLogin}>
                <Text style={[styles.loginText, { color: cmsConfig?.buttonColor || "#E50914" }]}>
                  {" "}
                  Login
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  card: {
    width: "85%",
    padding: 25,
    borderRadius: 25,
    alignSelf: "center",
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  field: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    marginBottom: 5,
  },
  inputError: {
    borderColor: "#ff4d4d",
  },
  errText: {
    color: "#ff4d4d",
    fontSize: 12,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  apiErrorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#E50914",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    color: "#333",

  },
  modalOption: {
    paddingVertical: 15,
    alignItems: "center",
    color: "#333",
  },
});
