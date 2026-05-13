import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import orderingStore from "../store/orderingStore";

export default function CustomHeader({ uiConfig }) {
  const navigation = useNavigation();
  const { cartItems } = orderingStore();
  const [logoAspectRatio, setLogoAspectRatio] = useState(3);

  const cartLength = cartItems.length;
  const logoHeight = logoAspectRatio < 1.2 ? 34 : logoAspectRatio < 2.5 ? 120: 28;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        {
          backgroundColor: uiConfig?.headerBgColor || "#000",
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.sideSpacer} />

        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Home")}
        >
          <Image
            source={
              uiConfig?.headerLogo
                ? { uri: uiConfig.headerLogo }
                : require("../assets/AR-Fashion.png")
            }
            style={[styles.logo, { aspectRatio: logoAspectRatio, height: logoHeight }]}
            onLoad={(event) => {
              const { width, height } = event.nativeEvent.source || {};
              if (width && height) {
                setLogoAspectRatio(width / height);
              }
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartContainer}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Ionicons
            name="cart-outline"
            size={26}
            color={uiConfig?.headerIconColor || "#E50914"}
          />

          {cartLength > 0 && (
            <View style={[styles.badge,{backgroundColor:"#000",borderWidth:1,borderColor:uiConfig?.headerIconColor}]}>
              <Text style={{color:uiConfig?.headerIconColor}}>{cartLength}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
  },

  sideSpacer: {
    width: 34,
  },

  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  logo: {
    maxWidth: "84%",
    resizeMode: "contain",
  },

  cartContainer: {
    width: 34,
    alignItems: "flex-end",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 21,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});