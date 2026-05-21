import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const MerchantInfoComponent = ({ merchant }) => {

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("terms");

  const styles = createStyles(merchant);

  /* ================= ACTIONS ================= */

  const openPhone = () => {
    if (merchant?.merchantPhoneNumber) {
      Linking.openURL(`tel:${merchant.merchantPhoneNumber}`);
    }
  };

  const openMap = () => {
    if (merchant?.merchantLocation) {
      Linking.openURL(merchant.merchantLocation);
    }
  };

  return (
    <SafeAreaView style={[
    styles.container,
    {
      backgroundColor:
        merchant?.headerBgColor || "#111",
    },
  ]}
  edges={["top"]}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={merchant?.headingColor || "#fff"}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Merchant Info
        </Text>

        <View style={{ width: 26 }} />

      </View>

      <ScrollView contentContainerStyle={{ padding: 20,backgroundColor:merchant?.backgroundColor || "#0F0F0F" }}>

        {/* MERCHANT CARD */}

        <View style={styles.card}>

          <Text style={styles.merchantName}>
            {merchant?.merchantName}
          </Text>

          <TouchableOpacity style={styles.row} onPress={openPhone}>
            <Ionicons
              name="call"
              size={18}
              color={merchant?.actionColor || "#E50914"}
            />
            <Text style={styles.text}>
              {merchant?.merchantPhoneNumber}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={openMap}>
            <Ionicons
              name="location"
              size={18}
              color={merchant?.actionColor || "#E50914"}
            />
            <Text style={styles.text}>
              View Location
            </Text>
          </TouchableOpacity>

        </View>

        {/* TABS */}

        <View style={styles.tabs}>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "terms" && styles.activeTab
            ]}
            onPress={() => setActiveTab("terms")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "terms" && styles.activeTabText
              ]}
            >
              Terms & Conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "policy" && styles.activeTab
            ]}
            onPress={() => setActiveTab("policy")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "policy" && styles.activeTabText
              ]}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>

        </View>

        {/* TAB CONTENT */}

        <View style={styles.contentCard}>

          {activeTab === "terms" && (
            <Text style={styles.description}>
              {merchant?.termsAndConditions || "No terms available"}
            </Text>
          )}

          {activeTab === "policy" && (
            <Text style={styles.description}>
              {merchant?.privacyPolicy || "No policy available"}
            </Text>
          )}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default MerchantInfoComponent;


/* =========================================================
   STYLES
========================================================= */

const createStyles = (ui) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: ui?.backgroundColor || "#0F0F0F"
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
      color:ui?.headingColor || "#fff",
      fontSize: 18,
      fontWeight: "800"
    },

    card: {
      backgroundColor: ui?.cardBackgroundColor || "#1C1C1C",
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)",
      marginBottom: 20
    },

    merchantName: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 12,
      color: ui?.cardTextColor || "#E50914"
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8
    },

    text: {
      marginLeft: 8,
      fontSize: 14,
      color: ui?.cardTextColor || "#E50914"
    },

    tabs: {
      flexDirection: "row",
      marginBottom: 12,
    },

    tab: {
      flex: 1,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
      alignItems: "center",
      
    },

    activeTab: {
      borderBottomColor: ui?.actionColor || "#E50914"
    },

    tabText: {
      color: ui?.subHeadingColor || "#E50914",
      fontSize: 14
    },

    activeTabText: {
      color: ui?.actionColor || "#E50914",
      fontWeight: "700"
    },

    contentCard: {
      backgroundColor: ui?.cardBackgroundColor || "#1C1C1C",
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)",
    },

    description: {
      fontSize: 14,
      lineHeight: 22,
      color: ui?.cardTextColor || "#E50914"
    }

  });