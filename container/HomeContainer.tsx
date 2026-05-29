import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import HomeTabs from "../component/HomeTabs";
import useCmsStore from "../store/useCmsStore";
import orderingStore from "../store/orderingStore";
import useMerchantStore from "../store/useMerchantStore";

const normalizeCmsFields = (cms: any): any => {
  if (!cms) return null;

  if (Array.isArray(cms)) {
    return cms.map((item: any) =>
      Object.values(item).reduce((acc: Record<string, any>, field: any) => {
        acc[field.fieldKey] = field.fieldValue;
        return acc;
      }, {})
    );
  }

  return Object.values(cms).reduce((acc: Record<string, any>, field: any) => {
    acc[field.fieldKey] = field.fieldValue;
    return acc;
  }, {});
};

const HomeContainer = () => {
  const { cmsData, getCmsData } = useCmsStore() as any;
  const { getLoyaltySettings, getCart } = orderingStore() as any;
  const { merchantStatus, inactiveMerchantName } = useMerchantStore();

  const [uiConfig, setUiConfig] = useState<Record<string, any>>({});
  const [homeBanner, setHomeBanner] = useState<any[]>([]);
  const [homeSlider, setHomeSlider] = useState<any[]>([]);
  const [greetingConfig, setGreetingConfig] = useState<Record<string, any>>({});
  useEffect(() => {
    if (merchantStatus !== "active" && merchantStatus !== "unknown") return;

    getCmsData();
    getLoyaltySettings();
    getCart();
  }, [merchantStatus]);

  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    let mergedUiConfig: Record<string, any> = {};

    cmsData.forEach((item: any) => {
      switch (item.modelSlug) {
        case "homeUiConfiguration":
          mergedUiConfig = {
            ...mergedUiConfig,
            ...normalizeCmsFields(item.cms),
          };
          break;

        case "homeOrderingBanner":
          setHomeBanner(normalizeCmsFields(item.cms));
          break;

        case "homeCtaCards":
          setHomeSlider(normalizeCmsFields(item.cms));
          break;

        case "appWelcomeMessage":
          setGreetingConfig(normalizeCmsFields(item.cms));
          break;

        /* ================= NEW CMS ================= */

        case "homeSectionOffers":
          mergedUiConfig.homeSectionOffers =
            normalizeCmsFields(item.cms);
          break;

        case "HomeExploreCategories":
          mergedUiConfig.HomeExploreCategories =
            normalizeCmsFields(item.cms);
          break;

        case "socialPages":
          mergedUiConfig.socialPages =
            normalizeCmsFields(item.cms);
          break;

        default:
          break;
      }
    });

    setUiConfig(mergedUiConfig);
  }, [cmsData]);

  if (merchantStatus === "inactive") {
    return (
      <SafeAreaView style={styles.inactiveScreen}>
        <LinearGradient
          colors={["#1a1a1a", "#120d0d", "#0f0f0f"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inactiveCard}
        >
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>INACTIVE</Text>
          </View>
          <Text style={styles.inactiveTitle}>Merchant Not Active</Text>
          <Text style={styles.inactiveName}>{inactiveMerchantName || "Selected Merchant"}</Text>
          <Text style={styles.inactiveSubtitle}>
            This merchant account is currently deactivated. Please contact support for more information.
          </Text>

          <View style={styles.statusStrip}>
            <Text style={styles.statusStripText}>Access blocked until merchant is active</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HomeTabs
        uiConfig={uiConfig}
        homeBanner={homeBanner}
        homeSlider={homeSlider}
        greetingConfig={greetingConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inactiveScreen: {
    flex: 1,
    backgroundColor: "#0e0e0e",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inactiveCard: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#3a2424",
  },
  badgeWrap: {
    alignSelf: "flex-start",
    backgroundColor: "#351919",
    borderWidth: 1,
    borderColor: "#7a2a2a",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    color: "#ff8383",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  inactiveTitle: {
    color: "#ffe4e4",
    fontSize: 24,
    fontWeight: "700",
  },
  inactiveName: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  inactiveSubtitle: {
    color: "#b8a4a4",
    marginTop: 12,
    lineHeight: 20,
    fontSize: 13,
    marginBottom: 18,
  },
  statusStrip: {
    backgroundColor: "#231414",
    borderWidth: 1,
    borderColor: "#5b2d2d",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusStripText: {
    color: "#ffb2b2",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default HomeContainer
