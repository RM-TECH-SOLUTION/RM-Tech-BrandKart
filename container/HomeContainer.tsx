import React, { useEffect, useState } from "react";
import { View } from "react-native";
import HomeTabs from "../component/HomeTabs";
import useCmsStore from "../store/useCmsStore";
import orderingStore from "../store/orderingStore";

const normalizeCmsFields = (cms) => {
  if (!cms) return null;

  if (Array.isArray(cms)) {
    return cms.map((item) =>
      Object.values(item).reduce((acc, field) => {
        acc[field.fieldKey] = field.fieldValue;
        return acc;
      }, {})
    );
  }

  return Object.values(cms).reduce((acc, field) => {
    acc[field.fieldKey] = field.fieldValue;
    return acc;
  }, {});
};

const HomeContainer = () => {
  const { cmsData, getCmsData } = useCmsStore();
  const { getLoyaltySettings, getCart } = orderingStore();

  const [uiConfig, setUiConfig] = useState({});
  const [homeBanner, setHomeBanner] = useState([]);
  const [homeSlider, setHomeSlider] = useState([]);
  const [greetingConfig, setGreetingConfig] = useState({});

  useEffect(() => {
    getCmsData();
    getLoyaltySettings();
    getCart();
  }, []);

  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    let mergedUiConfig = {};

    cmsData.forEach((item) => {
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

export default HomeContainer
