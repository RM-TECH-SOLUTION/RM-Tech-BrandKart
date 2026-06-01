import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/* ORDER FLOW */

const normalSteps = ["pending", "accepted", "shipped", "delivered"];
const rejectedSteps = ["pending", "rejected", "accepted", "shipped", "delivered"];

const stepLabels = {
  pending: "Order",
  rejected: "Rejected",
  accepted: "Accepted",
  shipped: "Shipped",
  delivered: "Delivered"
};

const OrderHistoryScreen = ({ orderHistoryResponse = [], uiConfig = {} }) => {

  const navigation = useNavigation();

  const uiConfigs = uiConfig || {};

  /* fallback colors */

  const backgroundColor = uiConfigs?.backgroundColor || "#0F0F0F";
  const cardBackgroundColor = uiConfigs?.cardBackgroundColor || "#1C1C1C";
  const progressBarColor = uiConfigs?.progressBarColor || "#444";
  const progressBarFillColor = uiConfigs?.progressBarFillColor || "#4CAF50";
  const titleColor = uiConfigs?.cardTextTitleColor || "#fff";
  const subTitleColor = uiConfigs?.cardTextSubTitleColor || "#aaa";


  /* ================= PROGRESS BAR ================= */

  const renderProgress = (status) => {

    const isRejected = status?.toLowerCase() === "rejected";
    const steps = isRejected ? rejectedSteps : normalSteps;
    const currentStep = steps.indexOf(status?.toLowerCase());

    return (
      <View style={styles.progressContainer}>

        {steps.map((step, index) => {

          const active = index <= currentStep;
          const isRejectedStep = step === "rejected";
          const stepFillColor = active && isRejectedStep
            ? "#E53935"
            : active
              ? progressBarFillColor
              : progressBarColor;
          const stepLabelColor = active && isRejectedStep
            ? "#E53935"
            : active
              ? progressBarFillColor
              : subTitleColor;

          return (
            <View key={index} style={styles.step}>

              <View
                style={[
                  styles.circle,
                  { backgroundColor: stepFillColor }
                ]}
              />

              {index !== steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        index < currentStep ? stepFillColor : progressBarColor
                    }
                  ]}
                />
              )}

              <Text
                style={[
                  styles.stepLabel,
                  { color: stepLabelColor }
                ]}
              >
                {stepLabels[step]}
              </Text>

            </View>
          );
        })}

      </View>
    );
  };

  /* ================= CARD ================= */

  const renderItem = ({ item }) => {

    const product = item?.items?.[0];

    const image =
      product?.images?.[0] ||
      "https://via.placeholder.com/100";

    const name = product?.item_name || "Product";

    const date = new Date(item.created_at).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

    return (

      <View style={[styles.card,{backgroundColor:cardBackgroundColor}]}>

        <View style={{flexDirection:"row"}}>

          <View style={{marginRight:15}}>
            <Image source={{ uri: image }} style={styles.image} />
             <Text style={[styles.price,{color:uiConfigs?.cardTextTitleColor,fontSize:12,}]}>
              Earn Points:- {item?.earned_points}
            </Text>
          </View>

<View style={{flex: 1}}>

            <Text style={[styles.name,{color:titleColor}]} numberOfLines={3} ellipsizeMode={'tail'}>
              {name}
            </Text>

            {!!product?.variant_name && (
              <Text style={{color:subTitleColor}}>
                {product?.variant_name}
              </Text>
            )}

            <Text style={[styles.orderId,{color:subTitleColor}]}>
              Order ID: {item.order_id}
            </Text>

            <Text style={[styles.date,{color:subTitleColor}]}>
              Ordered on {date}
            </Text>
            <Text style={[styles.date,{color:subTitleColor}]}>
              Total Discount:- {item?.discount}
            </Text>
           

            <Text style={[styles.price,{color:titleColor}]}>
              ₹{item.amount}
            </Text>

          </View>

        </View>

        <View style={styles.info}>
          {renderProgress(item.order_status)}
        </View>

      </View>

    );
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView   style={[
    styles.container,
    {
      backgroundColor:
        uiConfigs?.headerBgColor || "#111",
    },
  ]}
  edges={["top"]}
>

      <StatusBar backgroundColor={uiConfigs?.headerBgColor || "#111"} barStyle="light-content" />

      {/* HEADER */}

      <View style={[styles.header,{backgroundColor:uiConfigs?.headerBgColor || "#111"}]}>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={uiConfigs?.headerTextColor || "#111"} />
        </TouchableOpacity>

        <Text style={[styles.title,{color:uiConfigs?.headerTextColor || "#111"}]}>
          Order History
        </Text>

        <View style={{ width: 26 }} />

      </View>
     

      {/* LIST */}
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
       {orderHistoryResponse?.length == 0 && (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText,{color:uiConfigs?.cardTextTitleColor}]}>No orders found</Text>
      </View>
      ) }
      <FlatList
        data={orderHistoryResponse}
        keyExtractor={(item) => item.order_id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa"
  },

  header: {
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  title: {
    fontSize: 18,
    fontWeight: "800"
  },

  card: {
    flexDirection: "column",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth:1,
     borderColor:"rgba(0,0,0,0.2)"
  },

  image: {
    width: 85,
    height: 85,
    borderRadius: 12
  },

  info: {
    flex: 1,
    marginLeft: 12
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    flexShrink: 1,
    flexWrap: 'wrap'
  },

  orderId: {
    fontSize: 12,
    marginTop: 2
  },

  date: {
    fontSize: 12
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12
  },

  step: {
    flex: 1,
    alignItems: "center"
  },

  circle: {
    width: 14,
    height: 14,
    borderRadius: 7
  },

  line: {
    position: "absolute",
    top: 6,
    left: "50%",
    width: "100%",
    height: 3
  },

  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textTransform: "capitalize"
  }

});