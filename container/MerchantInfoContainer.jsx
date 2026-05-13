import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MerchantInfoComponent from "../component/MerchantInfoComponent";
import useCmsStore from "../store/useCmsStore";

const MerchantInfoContainer = () => {

  const { cmsData } = useCmsStore();
  const [uiConfig, setUiConfig] = useState({});

  useEffect(() => {

    if (!Array.isArray(cmsData)) return;

    const config = cmsData.find(
      (item) => item.modelSlug === "merchantInfo"
    );

    if (!config?.cms) return;

    const formatted = Object.values(config.cms).reduce((acc, field) => {
      acc[field.fieldKey] = field.fieldValue;
      return acc;
    }, {});

    setUiConfig(formatted);

  }, [cmsData]);

  

  return (
    <View style={{ flex: 1 }}>
      <MerchantInfoComponent merchant={uiConfig} />
    </View>
  );
};

export default MerchantInfoContainer;