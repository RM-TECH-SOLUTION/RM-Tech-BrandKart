import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const AddAddressComponent = ({
  onSave,
  uiConfig = {},
  getProfile,
}) => {

  const styles = createStyles(uiConfig);

  const [showModal, setShowModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const SERVICEABLE_PINCODES =
    uiConfig?.serviceablePincodes
      ? uiConfig.serviceablePincodes.split(",").map(p => p.trim())
      : [];

  const [address, setAddress] = useState({
    building: "",
    doorNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: ""
  });

  /* ================= LIVE LOCATION ================= */

  const getLiveLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const addressResponse =
        await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

      if (addressResponse.length > 0) {
        const loc = addressResponse[0];

        setAddress({
          building: loc.name || "",
          doorNo: "",
          street: loc.street || "",
          landmark: "",
          city: loc.city || loc.subregion || "",
          state: loc.region || "",
          pincode: loc.postalCode || ""
        });
      }

    } catch (error) {
      Alert.alert("Error", "Unable to fetch location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  /* ================= VALIDATION + SAVE ================= */

  const handleSave = () => {

    if (
      !address.building ||
      !address.doorNo ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    if (
      SERVICEABLE_PINCODES.length &&
      !SERVICEABLE_PINCODES.includes(address.pincode)
    ) {
      Alert.alert("Not Serviceable", "Service not available in this area.");
      return;
    }

    onSave && onSave(address);

    setShowModal(false);

    // Reset form after save (optional)
    setAddress({
      building: "",
      doorNo: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      pincode: ""
    });
  };

  /* ================= UI ================= */

  return (
    <View>

      {/* ADD ADDRESS BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addText}>
          {uiConfig?.addAddressText || "+ Add Delivery Address lll"}
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
              >

                {/* HEADER */}
                <View style={styles.header}>
                  <Text style={styles.heading}>
                    {uiConfig?.modalTitle || "Delivery Address"}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {getProfile(),setShowModal(false)}}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color={
                        uiConfig?.headerTextColor ||
                        uiConfig?.headingColor ||
                        "#fff"
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* LIVE LOCATION */}
                <TouchableOpacity
                  style={styles.locationBtn}
                  onPress={getLiveLocation}
                >
                  {loadingLocation ? (
                    <ActivityIndicator
                      color={uiConfig?.primaryColor || "#E50914"}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={uiConfig?.primaryColor || "#E50914"}
                      />
                      <Text style={styles.locationText}>
                        {uiConfig?.liveLocationText || "Use Live Location"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* INPUT FIELDS */}
                {Object.keys(address).map((key) => (
                  <TextInput
                    key={key}
                    placeholder={
                      key.charAt(0).toUpperCase() + key.slice(1)
                    }
                    placeholderTextColor={
                      uiConfig?.placeholderColor || "#777"
                    }
                    style={styles.input}
                    value={address[key]}
                    onChangeText={(text) =>
                      setAddress({ ...address, [key]: text })
                    }
                  />
                ))}

                {/* SAVE BUTTON */}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>
                    {uiConfig?.saveButtonText || "Save Address"}
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </View>
  );
};

export default AddAddressComponent;

/* =========================================================
   CMS DYNAMIC STYLES
========================================================= */

const createStyles = (ui) =>
  StyleSheet.create({

    addBtn: {
      margin: 16,
      padding: 16,
      backgroundColor: ui?.pageBgColor || "#1A1A1A",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: ui?.primaryColor || "#E50914",
      alignItems: "center"
    },

    addText: {
      color: ui?.primaryColor || "#E50914",
      fontSize: 15,
      fontWeight: "800"
    },

    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center"
    },

    modalContainer: {
      backgroundColor: ui?.modalBgColor || "#111",
      margin: 20,
      borderRadius: 20,
      padding: 20,
      maxHeight: "90%"
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },

    heading: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.headingColor || "#fff"
    },

    locationBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        ui?.locationBorderColor ||
        ui?.primaryColor ||
        "#E50914",
      padding: 12,
      borderRadius: 12,
      marginBottom: 14
    },

    locationText: {
      color: ui?.primaryColor || "#E50914",
      fontWeight: "700",
      marginLeft: 8
    },

    input: {
      backgroundColor: ui?.inputBgColor || "#1A1A1A",
      borderWidth: 1,
      borderColor: ui?.inputBorderColor || "#333",
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      color: ui?.inputTextColor || "#fff"
    },

    saveBtn: {
      backgroundColor:
        ui?.buttonBgColor ||
        ui?.primaryColor ||
        "#E50914",
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 10
    },

    saveText: {
      color: ui?.buttonTextColor || "#fff",
      fontWeight: "800"
    }

  });