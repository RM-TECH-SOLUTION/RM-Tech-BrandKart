import { create } from "zustand";
import { Alert } from "react-native";
import apiClient from "../api/apiClient";
import useSessionStore from "./useSessionStore";

const useAuthStore = create((set) => ({
  loading: false,
  success: false,
  errorMessage: null,

  /* ================= LOGIN ================= */

  loginUser: async (identity, password) => {
    set({ errorMessage: null, success: false });

    if (!identity || !password) {
      Alert.alert("Error", "Please enter email/phone and password");
      return;
    }

    set({ loading: true });

    try {
      const payload = {
        identity,
        password
      };

      // 🔥 Correct API
      const result = await apiClient.post(
        apiClient.Urls.login,
        payload
      );

      // console.log("LOGIN RESULT 👉", result);

      if (result?.success) {
        Alert.alert("Success", result.message || "Login successful!");

        const session = useSessionStore.getState();
        session.setUser(result.user);

        set({ success: true, errorMessage: null });
      } else {
        Alert.alert("Error", result?.message || "Invalid credentials");
        set({
          success: false,
          errorMessage: result?.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.log("LOGIN ERROR 👉", error.message);
      set({ success: false, errorMessage: error.message });
      Alert.alert("Error", "Network error: " + error.message);
    } finally {
      set({ loading: false });
    }
  },

  /* ================= REGISTER ================= */

  registerUser: async (
  name,
  email,
  phone,
  password,
  referralCode = null,
  gender = null
) => {

  set({ errorMessage: null, success: false });

  if (!name || !email || !phone || !password) {
    Alert.alert("Error", "All fields are required");
    return;
  }

  set({ loading: true });

  try {

    const payload = {
      name,
      email,
      phone,
      password,
      referral_code: referralCode,
      gender
    };

    const result = await apiClient.post(
      apiClient.Urls.register,
      payload
    );

    if (result?.success) {

      Alert.alert("Success", "Registered successfully!");

      const session = useSessionStore.getState();
      session.setUser(result.user);

      set({ success: true, errorMessage: null });

    } else {

      Alert.alert("Error", result?.message || "Registration failed");

      set({
        success: false,
        errorMessage: result?.message || "Registration failed",
      });

    }

  } catch (error) {

    console.log("REGISTER ERROR 👉", error.message);

    set({ success: false, errorMessage: error.message });

    Alert.alert("Error", "Network error: " + error.message);

  } finally {

    set({ loading: false });

  }
},

      saveUserAddress: async ( address) => {
 
    try {
      const result = await apiClient.post(
        apiClient.Urls.saveUserAddress,
        {
    address: address
  }
      );

      if (result?.success) {
        Alert.alert("Success", "Address saved successfully");
      } else {
        Alert.alert("Error", result?.message || "Failed to save address");
      }

      return result;
    } catch (error) {
      console.log("SAVE ADDRESS ERROR 👉", error.message);
      Alert.alert("Error", "Network error: " + error.message);
    } finally {
      set({ loading: false });
    }
  },

       getProfile: async ( ) => {
      const session = useSessionStore.getState();
 
    try {
      const result = await apiClient.post(
        apiClient.Urls.getProfile,
 
      );
      // console.log(result,"resultv");
      
      if (result?.success) {
      set({ profile: result?.user
});
      session.setProfile(result?.user);
      } 
      return result;
    } catch (error) {
      console.log("SAVE ADDRESS ERROR 👉", error.message);
    } finally {
      set({ loading: false });
    }
  },

  /* ================= LOGOUT ================= */

  logoutUser: () => {
    const session = useSessionStore.getState();
    session.clearSession();
    set({ success: false, errorMessage: null });
  },
}));

export default useAuthStore;
