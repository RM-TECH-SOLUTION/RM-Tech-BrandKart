import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import GreetingComponent from "./GreetingComponent";
import messaging from "@react-native-firebase/messaging";
import useSessionStore from "../store/useSessionStore";

const { width } = Dimensions.get("window");

const REDIRECT_ROUTE_MAP = {
  "/": "Home",
  "/home": "Home",
  "/categories": "Order",
  "/category": "Order",
  "/checkout": "Checkout",
  "/account": "Account",
  "/saved-address": "SavedAddressComponent",
  "/order-history": "OrderHistoryContainer",
  "/merchant-info": "MerchantInfoContainer",
  auth: "Auth",
  home: "Home",
  order: "Order",
  account: "Account",
  checkout: "Checkout",
  register: "Register",
};

const resolveNavigationTarget = (target) => {
  if (!target || typeof target !== "string") {
    return null;
  }

  const normalizedTarget = target.trim();
  const normalizedKey = normalizedTarget.toLowerCase();

  return (
    REDIRECT_ROUTE_MAP[normalizedTarget] ||
    REDIRECT_ROUTE_MAP[normalizedKey] ||
    normalizedTarget
  );
};

export default function HomeScreen({
  uiConfig = {},
  homeBanner = [],
  homeSlider = [],
  greetingConfig = {},
}) {
  const navigation = useNavigation();
  const sliderRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useSessionStore();

  const navigateToRedirectTarget = (target) => {
    const routeName = resolveNavigationTarget(target);

    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  /* ================= PERMISSION ================= */
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }

      await messaging().requestPermission();
    };

    requestPermission();
  }, []);

  /* ================= REGISTER FCM ================= */
  const registerFCM = async (userId) => {
    try {
      const token = await messaging().getToken();
      console.log("FCM TOKEN:", token);

      await fetch("https://api.rmtechsolution.com/saveToken.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          token: token,
        }),
      });
    } catch (err) {
      console.log("FCM Error:", err);
    }
  };

  /* ================= CALL REGISTER ================= */
  useEffect(() => {
    if (user?.id) {
      registerFCM(user.id);
    }
  }, [user?.id]);

  /* ================= TOKEN REFRESH ================= */
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log("New Token:", token);

      fetch("https://api.rmtechsolution.com/saveToken.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          token: token,
        }),
      });
    });

    return unsubscribe;
  }, [user?.id]);

  /* ================= FOREGROUND ================= */
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground:", remoteMessage);

      Alert.alert(
        remoteMessage?.notification?.title || "Notification",
        remoteMessage?.notification?.body || ""
      );
    });

    return unsubscribe;
  }, []);

  /* ================= CLICK HANDLING ================= */
  useEffect(() => {
    // Background click
    const unsubscribe = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log("Opened from background:", remoteMessage);

        navigation.navigate("Home"); // change if needed
      }
    );

    // App opened from quit
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("Opened from quit:", remoteMessage);
          navigation.navigate("Home");
        }
      });

    return unsubscribe;
  }, []);

  /* ================= AUTO SLIDER ================= */
  useEffect(() => {
    if (!homeBanner?.length) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= homeBanner.length) nextIndex = 0;

      sliderRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, homeBanner?.length]);

  /* ================= UI ================= */
/* ================= UI ================= */

console.log(
  uiConfig?.homeBgColorGradient,
  "uiConfig?.homeBgColorGradienthhhh"
);

const getGradientColors = () => {
  let gradientData = uiConfig?.homeBgColorGradient;

  // Handle stringified array from API
  if (typeof gradientData === "string") {
    try {
      gradientData = JSON.parse(gradientData);
      console.log("Parsed Gradient:", gradientData);
    } catch (e) {
      console.log("Gradient parse error:", e);
    }
  }

  // Validate gradient array
  if (Array.isArray(gradientData)) {
    const colors = gradientData
      .map((color) => String(color).trim())
      .filter(
        (color) =>
          color &&
          color.length > 0 &&
          color !== "null" &&
          color !== "undefined"
      );

    console.log("Filtered Colors:", colors);

    if (colors.length >= 2) {
      console.log("Using gradient:", colors);
      return colors;
    }
  }

  // Fallback solid color
  const solidColor = uiConfig?.homeBgColor || "#0B0B0F";

  console.log("Using solid color:", solidColor);

  return [solidColor, solidColor];
};

const gradientColors = getGradientColors();

console.log(gradientColors, "gradientColors");
  

  return (
    <LinearGradient
      colors={gradientColors}
      style={{ flex: 1,
      paddingTop: 10 }}
    >
      <ScrollView
        style={{
          flex: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
      <GreetingComponent greetingConfig={greetingConfig} backgroundColor={gradientColors?.[0]} />

      {/* HERO */}
      {homeBanner?.length > 0 && (
        <View>
          <Animated.FlatList
            ref={sliderRef}
            data={homeBanner}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width
              );
              setCurrentIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.heroSlide}>
                <Image source={{ uri: item.image }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />

                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>{item.title}</Text>

                  {item.subTitle && (
                    <Text style={styles.heroSub}>{item.subTitle}</Text>
                  )}

                  {item.linkText && (
                    <TouchableOpacity
                      style={styles.heroButton}
                      onPress={() => {
                        navigateToRedirectTarget(item.inAppPathRedirect);
                      }}
                    >
                      <Text style={styles.heroButtonText}>
                        {item.linkText}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />

          <View style={styles.indicatorContainer}>
            {homeBanner.map((_, index) => {
              const widthAnim = scrollX.interpolate({
                inputRange: [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ],
                outputRange: [8, 24, 8],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      width: widthAnim,
                      backgroundColor:
                        index === currentIndex ? "#E50914" : "#444",
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* CTA */}
      {homeSlider?.length > 0 && (
        <View style={styles.ctaWrapper}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <FlatList
            data={homeSlider}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.ctaCard}
                onPress={() => {
                  navigateToRedirectTarget(item.inAppPathRedirect);
                }}
              >
                <Image source={{ uri: item.image }} style={styles.ctaImage} />
                <View style={styles.ctaOverlay} />
                <Text style={styles.ctaTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  heroSlide: { width, height: 300 },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  heroContent: { position: "absolute", bottom: 40, left: 24, right: 24 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  heroSub: { color: "#ccc", marginTop: 6, fontSize: 14 },
  heroButton: {
    marginTop: 16,
    backgroundColor: "#E50914",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: 140,
    alignItems: "center",
  },
  heroButtonText: { color: "#fff", fontWeight: "bold" },
  indicatorContainer: { flexDirection: "row", justifyContent: "center" },
  indicator: { height: 6, borderRadius: 6, marginHorizontal: 4 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 16,
  },
  ctaWrapper: { marginTop: 24 },
  ctaCard: {
    width: 160,
    height: 160,
    marginLeft: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  ctaImage: { width: "100%", height: "100%" },
  ctaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  ctaTitle: {
    position: "absolute",
    bottom: 16,
    left: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});