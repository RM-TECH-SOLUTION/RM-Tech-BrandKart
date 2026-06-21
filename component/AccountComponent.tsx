import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProfileComponent from "./ProfileComponent";
import type { RootStackParamList } from "./AppNavigator";
import useCmsStore from "../store/useCmsStore";
import useAuthStore from "../store/useAuthStore";
import useSessionStore from "../store/useSessionStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AccountComponent = () => {
  const navigation = useNavigation<Nav>();
  const { cmsData } = useCmsStore();
  const { getProfile } = useAuthStore();
  const { profileData } = useSessionStore();

  const [uiConfig, setUiConfig] = useState<any>({});
  const [merchantInfo, setMerchantInfo] = useState<any>({});

  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    /* ACCOUNT PAGE CONFIG */

    const config = cmsData.find(
      (item) => item.modelSlug === "accountPageConfiguration"
    );

    if (config?.cms) {
      const formatted = Object.values(config.cms).reduce((acc: any, field: any) => {
        acc[field.fieldKey] = field.fieldValue;
        return acc;
      }, {});

      setUiConfig(formatted);
    }

    /* MERCHANT INFO */

    const merchant = cmsData.find(
      (item) => item.modelSlug === "merchantInfo"
    );

    if (merchant?.cms) {
      const formattedMerchant = Object.values(merchant.cms).reduce(
        (acc: any, field: any) => {
          acc[field.fieldKey] = field.fieldValue;
          return acc;
        },
        {}
      );

      setMerchantInfo(formattedMerchant);
    }

  }, [cmsData]);

  useEffect(() => {
    getProfile();
  }, []);

  /* =========================
     CHECK BACKGROUND IS DARK
  ========================= */

  const isDarkBackground = useMemo(() => {
    const bgColor =
      uiConfig?.gradientStart ||
      uiConfig?.cardBgColor ||
      "#0F0F0F";

    const hex = bgColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // brightness formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 150;
  }, [uiConfig]);

  const styles = createStyles(uiConfig, isDarkBackground);

  const accountList = [
    { icon: "time-outline", name: "History", route: "OrderHistoryContainer" },
    { icon: "home-outline", name: "My Address", route: "SavedAddressComponent" },
    { icon: "help-circle-outline", name: "Help", route: "MerchantInfoContainer" }
  ];

  return (
    <LinearGradient
      colors={[
        uiConfig?.gradientStart || "#0F0F0F",
        uiConfig?.gradientEnd || "#1A1A1A"
      ]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <ProfileComponent
          navigation={navigation}
          uiConfig={uiConfig}
          profileData={profileData}
          merchantInfo={merchantInfo}
        />

        <Text style={styles.sectionTitle}>
          Account Settings
        </Text>

        <View>
          {accountList.map((item) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route as any)}
              style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.7 }
              ]}
            >
              <View style={styles.left}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={uiConfig?.cardIconColor || "#E50914"}
                  style={{ marginRight: 14 }}
                />

                <Text style={styles.text}>
                  {item.name}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={uiConfig?.chevronColor || "#888"}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.poweredByWrap}>
          <Text style={styles.poweredByText}>Powered by</Text>
            <Image
              source={require("../assets/rmtechlogo.png")}
              style={styles.poweredByLogo}
              resizeMode="cover"
            />
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

export default AccountComponent;

/* =========================================================
   DYNAMIC STYLES
========================================================= */

const createStyles = (ui: any, isDarkBackground: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginHorizontal: 20,
      marginVertical: 15,

      // AUTO TEXT COLOR
      color: isDarkBackground ? "#FFFFFF" : "#000000"
    },

    card: {
      flexDirection: "row",
      padding: 20,
      backgroundColor: ui?.cardBgColor || "#1C1C1C",
      marginHorizontal: 16,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: ui?.cardBorderColor || "#2A2A2A",
      shadowColor: ui?.shadowColor || "#000",
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4
    },

    left: {
      flexDirection: "row",
      alignItems: "center"
    },

    text: {
      fontSize: 16,
      fontWeight: "600",
      color: ui?.cardTextColor || "#fff"
    },

    poweredByWrap: {
      alignItems: "center",
      justifyContent: "flex-end",
    },

    poweredByText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDarkBackground ?  "#000000":"#a1a9b6" ,
    },

    poweredByLogo: {
      width: "30%",
      height: "30%",
    }
  });