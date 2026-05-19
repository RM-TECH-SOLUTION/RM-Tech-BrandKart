import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useSessionStore from "../store/useSessionStore";

const ProfileComponent = ({
  navigation,
  profileData = {},
  uiConfig = {},
  merchantInfo
}) => {

  const { user, loading, clearSession } = useSessionStore();
  const styles = createStyles(uiConfig);
  const appLink = merchantInfo?.appLink;
  const webLink = merchantInfo?.webLink;
  const merchantName = merchantInfo?.merchantName

  /* ================= SHARE REFERRAL ================= */
  // console.log(merchantInfo,"profileDataprofileData");


  const handleShareReferral = async () => {
    if (!profileData?.referral_code) {
      Alert.alert("Error", "Referral code not available");
      return;
    }

    try {

      const storeName = merchantName || "Our Store";

      let message = `🎉 *Join ${storeName}!* 🎉\n\n`;

      message += `Use my referral code and start earning rewards!\n\n`;
      message += `🔑 Referral Code: *${profileData.referral_code}*\n\n`;

      if (appLink) {
        message += `📱 Download the App:\n${appLink}\n\n`;
      }

      if (webLink) {
        message += `🌐 Visit the Website:\n${webLink}\n\n`;
      }

      message += `✨ Sign up today and enjoy exclusive rewards!\n`;
      message += `Don't forget to use my code during signup 🚀`;

      await Share.share({
        message
      });

    } catch {
      Alert.alert("Error", "Unable to share referral code");
    }
  };

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={uiConfig?.primaryColor || "#E50914"}
        />
      </View>
    );
  }

  /* ================= GUEST VIEW ================= */

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarCircle}>
          <Ionicons
            name="person-outline"
            size={30}
            color="#fff"
          />
        </View>

        <Text style={styles.guestTitle}>Hey Guest 👋</Text>
        <Text style={styles.guestSub}>
          Login to manage your account
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Auth")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ================= USER VIEW ================= */

  return (
    <View style={styles.container}>

      {/* PROFILE HEADER */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, }}>
          <Ionicons
            name="call-outline"
            size={18}
            color={uiConfig?.primaryColor || "#E50914"}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.email}>{user.phone}</Text>
        </View>

      </View>

      {/* LOYALTY POINTS */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons
            name="star-outline"
            size={20}
            color={"gold"}
          />
          <Text style={styles.cardText}>
            {profileData?.total_points || 0} Points
          </Text>
        </View>
      </View>

      {/* REFERRAL SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>

        <View style={styles.referralBox}>

          {/* LEFT SIDE → CODE */}
          <Text style={styles.referralCode}>
            {profileData?.referral_code || "N/A"}
          </Text>

          {/* RIGHT SIDE → SHARE BUTTON */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareReferral}
          >
            <Ionicons name="share-social-outline" size={16} color="#fff" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => clearSession()}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileComponent;

const createStyles = (ui) =>
  StyleSheet.create({

    container: {
      backgroundColor: ui?.cardBgColor || "#1C1C1C",
      alignItems: "center",
      padding: 15,
      marginHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: ui?.cardBorderColor || "#2A2A2A",
      marginBottom: 10
    },

    loaderContainer: {
      padding: 40,
      alignItems: "center"
    },

    profileHeader: {
      alignItems: "center",
    },

    avatarCircle: {
      width: 45,
      height: 45,
      borderRadius: 35,
      backgroundColor: ui?.cardIconColor || "#E50914",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 5
    },

    avatarText: {
      fontSize: 22,
      fontWeight: "800",
      color: "#fff"
    },

    name: {
      fontSize: 20,
      fontWeight: "800",
      color: ui?.cardTextColor || "#fff"
    },

    email: {
      fontSize: 14,
      color: ui?.cardTextColor || "#ccc",
      marginTop: 4
    },

    card: {
      width: "100%",
      backgroundColor: "rgba(0,0,0,0.2)",
      padding: 15,
      borderRadius: 14,
      marginTop: 10
    },

    row: {
      flexDirection: "row",
      alignItems: "center"
    },

    cardText: {
      marginLeft: 10,
      fontSize: 15,
      color: ui?.cardTextColor || "#fff",
      fontWeight: "bold"
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: ui?.cardTextColor || "#fff",
    },

    referralBox: {
      backgroundColor: ui?.cardBorderColor || "#2A2A2A",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 10,
      padding: 10,
      marginTop: 8
    },

    referralCode: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 2,
      color: ui?.cardIconColor || "#E50914"
    },

    shareButton: {
      flexDirection: "row",
      backgroundColor: ui?.cardIconColor || "#E50914",
      padding: 7,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center"
    },

    shareText: {
      color: "#fff",
      marginLeft: 8,
      fontWeight: "700"
    },

    logoutButton: {
      backgroundColor: ui?.cardIconColor || "#E50914",
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 14,
      marginTop: 10
    },

    logoutText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700"
    },

    guestTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.cardTextColor || "#fff",
      marginTop: 10
    },

    guestSub: {
      fontSize: 14,
      color: ui?.cardTextColor || "#aaa",
      marginBottom: 15
    },

    loginButton: {
      backgroundColor: ui?.cardIconColor || "#E50914",
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 14
    },

    loginText: {
      color: "#fff",
      fontWeight: "700"
    }

  });