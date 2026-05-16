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
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
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

const getTextColorForBackground = (bgColor) => {
  if (!bgColor || typeof bgColor !== "string") {
    return "#fff";
  }

  let color = bgColor.trim().toLowerCase();

  if (color.startsWith("#")) {
    if (color.length === 4) {
      color = color.replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, "#$1$1$2$2$3$3");
    }

    if (color.length === 7) {
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 186 ? "#000" : "#fff";
    }
  }

  if (color.startsWith("rgb")) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = Number(match[1]);
      const g = Number(match[2]);
      const b = Number(match[3]);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 186 ? "#000" : "#fff";
    }
  }

  return "#fff";
};

const gradientColors = getGradientColors();
const quickActionTextColor = getTextColorForBackground(gradientColors?.[0]);

const staticSocialPages = [
  {
    id: "s1",
    title: "Facebook",
    icon: "facebook-square",
    url: "https://www.facebook.com",
    color: "#1877F2",
  },
  {
    id: "s2",
    title: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com",
    color: "#E1306C",
  },
  {
    id: "s3",
    title: "YouTube",
    icon: "youtube-play",
    url: "https://www.youtube.com",
    color: "#FF0000",
  },
];

const staticPatternCards = [
  {
    id: "p1",
    title: "Men's T-Shirts",
    subtitle: "Comfort fits",
    price: "Starts at ₹99",
    bgColor: "#3CB371",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
    inAppPathRedirect: "Order",
  },
  {
    id: "p2",
    title: "Women's Tops",
    subtitle: "New arrivals",
    price: "Starts at ₹149",
    bgColor: "#8A2BE2",
    image:
      "https://as1.ftcdn.net/v2/jpg/02/86/68/80/1000_F_286688069_n7HH5pKqK49Dfm3KvAlKGs0AD4HbrFlV.jpg",
    inAppPathRedirect: "Order",
  },
  {
    id: "p3",
    title: "Kids Shoes",
    subtitle: "Durable & comfy",
    price: "Starts at ₹199",
    bgColor: "#FFD700",
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80",
    inAppPathRedirect: "Order",
  },
];

const staticOfferCards = [
  {
    id: "o1",
    title: "M-Flex",
    description: "Out of fuel? Get fuel credit today with M-Flex.",
    buttonText: "Get fuel credit",
    bgColor: "#D2232A",
    inAppPathRedirect: "Order",
  },
  {
    id: "o2",
    title: "Refer and earn!",
    description: "Get ₦1,000 when you invite a friend to use Messenger today!",
    buttonText: "Start referring",
    bgColor: "green",
    inAppPathRedirect: "Account",
  },
  {
    id: "o4",
    title: "Stay motivated!",
    description: "Redeem coupons when you reach your order goals. Get started today!",
    buttonText: "View stats",
    bgColor: "#BA2E42",
    inAppPathRedirect: "Home",
  },
];

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
          <Text style={[styles.sectionTitle, { color: quickActionTextColor }]}>Quick Actions</Text>

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

          <View style={styles.patternSection}>
            <Text style={[styles.patternHeader, { color: quickActionTextColor }]}>Explore Categories</Text>
            <View style={styles.patternGrid}>
              {staticPatternCards.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.patternCard, { backgroundColor: item.bgColor }]}
                  onPress={() => navigateToRedirectTarget(item.inAppPathRedirect)}
                >
                  <Image source={{ uri: item.image }} style={styles.patternImage} />

                  <LinearGradient
  colors={[
    "rgba(0,0,0,0)",
    `${item.bgColor}20`,
    `${item.bgColor}CC`,
    `${item.bgColor}`,
  ]}
  end={{ x: 0.15, y: 0.1 }}
  start={{ x: 0.9, y: 1 }}
  style={styles.patternGradient}
>
  <View style={styles.patternContent}>
    <Text style={styles.patternTitle}>{item.title}</Text>

    <Text style={styles.patternSubtitle}>
      {item.subtitle}
    </Text>

    <View style={styles.pricePill}>
      <Text style={styles.pricePillText}>
        {item.price}
      </Text>
    </View>
  </View>
</LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.offerSection}>
            <Text style={[styles.offerHeader, { color: quickActionTextColor }]}>Offers</Text>
            <View style={styles.offerGrid}>
              {staticOfferCards.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.offerCard, { backgroundColor: item.bgColor }]}
                  onPress={() => navigateToRedirectTarget(item.inAppPathRedirect)}
                >
                  <View style={styles.offerContent}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDescription}>{item.description}</Text>
                  </View>

                  <View style={styles.offerFooter}>
                    <View style={styles.offerButton}>
                      <Text style={styles.offerButtonText}>{item.buttonText}</Text>
                    </View>
                    <View style={styles.offerAccent} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.staticCtaSection}>
            <Text style={[styles.staticCtaHeader, { color: quickActionTextColor }]}>Social Pages</Text>
            <View style={styles.socialRow}>
              {staticSocialPages.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.socialCard, { backgroundColor: item.color }]}
                  onPress={() => openSocialLink(item.url)}
                >
                  <View style={styles.socialIconWrapper}>
                    <FontAwesome name={item.icon} size={28} color="#fff" />
                  </View>
                  <Text style={styles.socialTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  heroSlide: { width, height: 300,justifyContent: "center", alignItems: "center" },
  heroImage: { width: "100%", height: "100%",borderRadius: 0 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0,0,0,0.1)",
  },
  heroContent: { position: "absolute", bottom: 20, left: 24, right: 24 },
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
  patternSection: { marginTop: 24, paddingHorizontal: 16 },
  patternHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 0,
    marginBottom: 12,
  },
  patternGrid: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  patternCard: {
    width: "100%",
    minHeight: 280,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  patternContent: {
    padding: 16,
    backgroundColor: "transparent",
  },
  patternImage: {
    width: "100%",
    height: 192,
  },
  
  patternIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  patternIconText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  patternTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  patternSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    fontSize: 13,
  },
  pricePill: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pricePillText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 13,
  },
  offerSection: { marginTop: 20, paddingHorizontal: 16 },
  offerHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  offerGrid: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  offerCard: {
    width: "100%",
    minHeight: 150,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  offerContent: {
    flex: 1,
  },
  offerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  offerButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  offerButtonText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "700",
  },
  offerAccent: {
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  offerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  offerDescription: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    lineHeight: 18,
  },
  staticCtaSection: { marginTop: 16, paddingHorizontal: 16 },
  staticCtaHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  socialCard: {
    width: "31%",
    minHeight: 124,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  socialIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  socialTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  ctaCard: {
    width: 160,
    height: 160,
    marginLeft: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  staticCtaCard: {
    marginLeft: 0,
    marginBottom: 12,
    flex: 1,
    minWidth: 100,
    maxWidth: 160,
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
  patternGradient: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 120,
  justifyContent: "flex-end",
},
});