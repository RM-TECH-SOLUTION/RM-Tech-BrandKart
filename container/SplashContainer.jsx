import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Image, Text, StyleSheet, Dimensions } from "react-native";
import useCmsStore from "../store/useCmsStore";
import useSessionStore from "../store/useSessionStore";
import useMerchantStore from "../store/useMerchantStore";

const { width, height } = Dimensions.get("window");

const SplashContainer = ({ navigation }) => {
  const { getCmsData, cmsData } = useCmsStore();
  const { user } = useSessionStore();
  const { merchantName, setMerchantVerification } = useMerchantStore();

  const [splashCmsData, setSplashCmsData] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const rmLogo = require("../assets/adaptive-icon-rm.png");
  const defaultBackground = require("../assets/bgHome1.png");

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

    if (!splashItem?.cms) {
      setSplashCmsData({});
      setIsReady(true);
      return;
    }

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
    const cmsTimeout = Number(splashCmsData?.autoNavigationTimeout);
    const navigationDelay = Number.isFinite(cmsTimeout) && cmsTimeout >= 0 ? cmsTimeout : 0;

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

      if (!isMounted) return;
      setMerchantVerification("active", null);

      if (isMounted) {
        navigation.replace("Home");
      }
    }, navigationDelay);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isReady, merchantName, navigation, setMerchantVerification, splashCmsData, user]);

  /* ---------------- WAIT UNTIL CMS READY ---------------- */
  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <Image source={rmLogo} style={styles.loaderLogo} resizeMode="contain" />
        <ActivityIndicator size="small" color="#111827" style={styles.loaderSpinner} />
        <Text style={styles.loaderText}>Loading RM Tech...</Text>
      </View>
    );
  }

  const backgroundSource = splashCmsData?.backgroundImage
    ? { uri: splashCmsData.backgroundImage }
    : defaultBackground;

  const logoSource = splashCmsData?.logoImage
    ? { uri: splashCmsData.logoImage }
    : rmLogo;

  return (
    <View style={styles.splashContainer}>
      <Image source={backgroundSource} style={styles.splashBackground} resizeMode="cover" />
      <View style={styles.splashOverlay} />

      <View style={styles.splashCenterContent}>
        <Image source={logoSource} style={styles.splashLogo} resizeMode="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loaderLogo: {
    width: 118,
    height: 118,
    borderRadius: 22,
  },
  loaderSpinner: {
    marginTop: 18,
  },
  loaderText: {
    marginTop: 12,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  splashBackground: {
    width,
    height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  splashCenterContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  splashLogo: {
    width: 140,
    height: 140,
    borderRadius: 20,
  },
});

export default SplashContainer;
