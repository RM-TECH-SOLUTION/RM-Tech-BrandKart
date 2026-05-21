import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AddAddressComponent from "./AddAddressComponent";
import useAuthStore from "../store/useAuthStore";
import useCmsStore from "../store/useCmsStore";

const SavedAddressComponent = () => {
  const navigation = useNavigation();
  const { profile, getProfile, saveUserAddress } = useAuthStore();
  const { cmsData } = useCmsStore();

  const profileAddress = profile?.address;

  const [address, setAddress] = useState(null);
  const [uiConfig, setUiConfig] = useState({});

  /* ================= CMS ================= */

  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    const config = cmsData.find(
      (item) => item.modelSlug === "addressPageConfiguration"
    );

    if (!config?.cms) return;

    const formatted = Object.values(config.cms).reduce((acc, field) => {
      acc[field.fieldKey] = field.fieldValue;
      return acc;
    }, {});

    setUiConfig(formatted);
  }, [cmsData]);

  const styles = createStyles(uiConfig);

  /* ================= PREFILL ================= */

  useEffect(() => {
    if (profileAddress) {
      setAddress({
        ...profileAddress,
        id: "profile-address"
      });
    }
  }, [profileAddress]);

  /* ================= SAVE ================= */

  const handleSaveAddress = (newAddress) => {
    setAddress({
      ...newAddress,
      id: "profile-address"
    });
    saveUserAddress(newAddress);
  };

  return (
    <SafeAreaView style={[
    styles.container,
    {
      backgroundColor:
        uiConfig?.headerBgColor || "#111",
    },
  ]}
  edges={["top"]}>
      <StatusBar
        backgroundColor={uiConfig?.headerBgColor || "#111"}
        barStyle="light-content"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={uiConfig?.headerTextColor || "#fff"}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Delivery Address</Text>

        <View style={{ width: 26 }} />
      </View>
      <View style={{ flex: 1 ,backgroundColor: uiConfig?.pageBgColor || "#0F0F0F" }}>
      {/* ADDRESS CONTENT */}
      <View style={styles.content}>
        {address ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons
                name="location"
                size={20}
                color={uiConfig?.cardTextColor  || "#E50914"}
              />
              <Text style={styles.cardTitle}>Saved Address</Text>
            </View>

            <Text style={styles.name}>{address.building}</Text>

            <Text style={styles.details}>
              {address.doorNo}, {address.street}
            </Text>

            {address.landmark ? (
              <Text style={styles.details}>{address.landmark}</Text>
            ) : null}

            <Text style={styles.details}>
              {address.city} - {address.pincode} - {address.state}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No address added yet
          </Text>
        )}
      </View>

      {/* ADD / EDIT */}
      <View style={{ marginBottom: 40 }}>
        <AddAddressComponent
          onSave={handleSaveAddress}
          getProfile={getProfile}
          uiConfig={uiConfig}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};

export default SavedAddressComponent;

/* =========================================================
   DYNAMIC STYLES
========================================================= */

const createStyles = (ui) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: ui?.pageBgColor || "#0F0F0F"
    },

    header: {
      backgroundColor: ui?.headerBgColor || "#111",
      paddingHorizontal: 18,
      paddingVertical: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },

    title: {
      color: ui?.headerTextColor || "#fff",
      fontSize: 18,
      fontWeight: "800"
    },

    content: {
      padding: 20,

    },

    card: {
      backgroundColor: ui?.cardBgColor || ui?.cardBgColor || "#fff",
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: ui?.cardBorderColor || "#2A2A2A"
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10
    },

    cardTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 6,
      color: ui?.cardTextColor || "#E50914"
    },

    name: {
      fontSize: 16,
      fontWeight: "800",
      color: ui?.cardTextColor || "#fff",
      marginBottom: 6
    },

    details: {
      fontSize: 14,
      color: ui?.cardTextColor || "#ccc",
      marginBottom: 4
    },

    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: ui?.emptyTextColor || "#888",
      fontSize: 15
    }

  });