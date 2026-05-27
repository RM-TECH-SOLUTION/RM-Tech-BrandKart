import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import useMerchantStore from "../store/useMerchantStore";

const FIND_MERCHANT_URL = "https://api.rmtechsolution.com/findMerchant.php";

interface MerchantSetupScreenProps {
  navigation: any;
}

const MerchantSetupScreen: React.FC<MerchantSetupScreenProps> = ({ navigation }) => {
  const [merchantName, setMerchantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setMerchant } = useMerchantStore();

  const handleSubmit = async () => {
    const trimmed = merchantName.trim();
    if (!trimmed) {
      setError("Please enter a merchant name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `${FIND_MERCHANT_URL}?name=${encodeURIComponent(trimmed)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }

      if (data?.success && data?.data?.id) {
        const id = Number(data.data.merchantId);
        setMerchant(id, data.data.name);
        navigation.replace("Splash");
      } else {
        setError("Merchant not found. Please check the name and try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your merchant name to get started</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Merchant Name"
          placeholderTextColor="#666"
          value={merchantName}
          onChangeText={(text) => {
            setMerchantName(text);
            if (error) setError("");
          }}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!loading}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    backgroundColor: "#2c2c2e",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#3a3a3c",
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#f0a500",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MerchantSetupScreen;