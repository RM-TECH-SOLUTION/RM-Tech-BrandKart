import React, { useEffect, useState } from "react";
import { View } from "react-native";
import OrderHistoryScreen from "../component/OrderHistoryScreen";
import useAuthStore from "../store/useAuthStore";
import orderingStore from "../store/orderingStore";
import useCmsStore from "../store/useCmsStore";

const OrderHistoryContainer = ({ navigation }) => {
   const {
    orderHistory,
    orderHistoryResponse
    } = orderingStore();
    const { cmsData } = useCmsStore();
    const {getProfile} = useAuthStore()

      const [uiConfig, setUiConfig] = useState({});
    
      useEffect(() => {
        if (!Array.isArray(cmsData)) return;
    
        const config = cmsData.find(
          (item) => item.modelSlug === "orderHistoryConfig"
        );
    
        if (!config?.cms) return;
    
        const formatted = Object.values(config.cms).reduce((acc, field) => {
          acc[field.fieldKey] = field.fieldValue;
          return acc;
        }, {});
    
        setUiConfig(formatted);
      }, [cmsData]);

      // console.log(uiConfig,"uiConfiguiConfighhh");
      
    

    useEffect(() => {    
        orderHistory()
        getProfile()
    }, []);

  return (
    <View style={{ flex: 1 }}>
      <OrderHistoryScreen
      orderHistoryResponse={orderHistoryResponse}
      uiConfig={uiConfig}
      />
    </View>
  );
};

export default OrderHistoryContainer;
