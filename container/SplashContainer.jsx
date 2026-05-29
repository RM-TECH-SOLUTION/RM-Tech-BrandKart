import React, { useEffect, useRef, useState } from "react";
import { View, Animated, ActivityIndicator } from "react-native";
import SplashScreen from "../component/SplashScreen";
import SplashScreen2 from "../component/SplashScreen2";
import splashScreenImage from "../assets/bgHome1.png";
import logoImage from "../assets/AR-Fashion.png";
import useCmsStore from "../store/useCmsStore";
import useSessionStore from "../store/useSessionStore";
import useMerchantStore from "../store/useMerchantStore";

const FIND_MERCHANT_URL = "https://api.rmtechsolution.com/findMerchant.php";

const SplashContainer = ({ navigation }) => {
  const template = 1;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bgScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { getCmsData, cmsData } = useCmsStore();
  const { user } = useSessionStore();
  const { merchantName, setMerchantVerification } = useMerchantStore();

  const [splashCmsData, setSplashCmsData] = useState(null);
  const [isReady, setIsReady] = useState(false);

  /* ---------------- FETCH CMS ---------------- */
  useEffect(() => {
    getCmsData();
  }, []);

  /* ---------------- FORMAT CMS ---------------- */
  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    const splashItem = cmsData.find(
      (item) => item.modelSlug === "splashConfiguration"
    );

    if (!splashItem?.cms) return;

    const formattedCms = Object.keys(splashItem.cms).reduce(
      (acc, key) => {
        acc[key] = splashItem.cms[key]?.fieldValue;
        return acc;
      },
      {}
    );

    setSplashCmsData(formattedCms);
    setIsReady(true); // ✅ Only now splash can render
  }, [cmsData]);

  /* ---------------- RUN ANIMATION AFTER CMS READY ---------------- */
  useEffect(() => {
    if (!isReady) return;

    let isMounted = true;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    if (template === 2) {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();
    }

    const timeout = setTimeout(async () => {
      if (!user) {
        if (isMounted) {
          setMerchantVerification("unknown", null);
          navigation.replace("Walkthrough");
        }
        return;
      }

      const trimmed = merchantName?.trim();
      if (!trimmed) {
        if (isMounted) {
          setMerchantVerification("active", null);
          navigation.replace("Home");
        }
        return;
      }

      try {
        const response = await fetch(
          `${FIND_MERCHANT_URL}?name=${encodeURIComponent(trimmed)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const data = await response.json();
        const status = data?.data?.status;

        if (!isMounted) return;

        if (data?.success && status === "active") {
          setMerchantVerification("active", null);
        } else {
          setMerchantVerification("inactive", data?.data?.name || trimmed);
        }
      } catch {
        if (!isMounted) return;
        // Keep app usable if verification fails due to temporary network issues.
        setMerchantVerification("active", null);
      }

      if (isMounted) {
        navigation.replace("Home");
      }
    }, splashCmsData?.autoNavigationTimeout || 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isReady, merchantName, navigation, setMerchantVerification, splashCmsData, user]);

  /* ---------------- WAIT UNTIL CMS READY ---------------- */
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  /* ---------------- ROTATION ---------------- */
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* ---------------- IMAGE SOURCES ---------------- */
  const backgroundSource = splashCmsData?.backgroundImage
    ? { uri: splashCmsData.backgroundImage }
    : splashScreenImage;

  const logoSource = splashCmsData?.logoImage
    ? { uri: splashCmsData.logoImage }
    : logoImage;

  return (
    <View style={{ flex: 1 }}>
      {template === 2 ? (
        <SplashScreen2
          fadeAnim={fadeAnim}
          rotateInterpolate={rotateInterpolate}
          backgroundImage={backgroundSource}
          logoImage={logoSource}
        />
      ) : (
        <SplashScreen
          fadeAnim={fadeAnim}
          scaleAnim={scaleAnim}
          bgScale={bgScale}
          backgroundImage={backgroundSource}
          logoImage={logoSource}
        />
      )}
    </View>
  );
};

export default SplashContainer;
