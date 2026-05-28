import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useCmsStore from "../store/useCmsStore";

interface Props {
  visible: boolean;
  orderType: "COD" | "online";
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

const OrderSuccessComponent = ({
  visible,
  orderType,
  onViewOrders,
  onContinueShopping,
}: Props) => {
  const isCOD = orderType === "COD";
  const { cmsData } = useCmsStore();
  const [categoryUiConfig, setCategoryUiConfig] = useState({});

  useEffect(() => {
      if (!Array.isArray(cmsData)) return;
  
      const config = cmsData.find(
        (item) => item.modelSlug === "categoryPageConfiguration"
      );
  
      if (!config?.cms) return;
  
      const formatted = Object.values(config.cms).reduce((acc, field) => {
        acc[field.fieldKey] = field.fieldValue;
        return acc;
      }, {});
  
      setCategoryUiConfig(formatted);
    }, [cmsData]);


  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card,{backgroundColor:categoryUiConfig?.cardBgColor || "rgba(0,0,0,0.7)"}]}>

          {/* Icon */}
          <View style={[styles.iconWrapper,{backgroundColor:"white",borderRadius:150,padding:10}]}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={[styles.title,{color:categoryUiConfig?.cardTextColor || "#fff"}]}>Order Placed Successfully!</Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle,{color:categoryUiConfig?.cardTextColor || "#aaa"}]}>
            {isCOD
              ? "Your order has been placed with Cash on Delivery. Please keep the exact amount ready."
              : "Your payment was successful. Your order is now being processed."}
          </Text>

          {/* Payment badge */}
          <View style={[styles.badge, isCOD ? styles.badgeCOD : styles.badgeOnline]}>
            <Ionicons
              name={isCOD ? "cash-outline" : "card-outline"}
              size={15}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.badgeText}>
              {isCOD ? "Cash on Delivery" : "Paid Online"}
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity style={[styles.primaryBtn,{backgroundColor:categoryUiConfig?.buttonColor || "#4CAF50"}]} onPress={onViewOrders}>
            <Text style={[styles.primaryBtnText,{color:categoryUiConfig?.buttonTextColor || "#fff"}]}>View My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryBtn,{backgroundColor:categoryUiConfig?.buttonColor || "#444"}]} onPress={onContinueShopping}>
            <Text style={[styles.primaryBtnText,{color:categoryUiConfig?.buttonTextColor || "#ccc"}]  }>Continue Shopping</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default OrderSuccessComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeCOD: {
    backgroundColor: "#E65100",
  },
  badgeOnline: {
    backgroundColor: "#1565C0",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#444",
  },
  secondaryBtnText: {
    color: "#ccc",
    fontSize: 15,
    fontWeight: "600",
  },
});

