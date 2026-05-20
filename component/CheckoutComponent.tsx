import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Modal,
  TextInput
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useSessionStore from "../store/useSessionStore";
import AddAddressComponent from "./AddAddressComponent";

const CheckoutComponent = ({
  cartItems = [],
  getCart,
  merchantData,
  updateQty,
  deleteCartItem,
  clearCart,
  saveUserAddress,
  getProfile,
  profile,
  uiConfig = {},
  addressUiConfig = {},
  loyaltySettings,
  profileData,
  apply_coupon
}) => {

  const navigation = useNavigation();
  const { user } = useSessionStore();

  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const styles = createStyles(uiConfig);

  const [pointsInput, setPointsInput] = useState("");
  const [appliedPoints, setAppliedPoints] = useState(null);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const availablePoints = profileData?.total_points || 0;
  const enableCOD = uiConfig?.enableCOD;
  const enableOnline = uiConfig?.enableOnline;

  // console.log(uiConfig, "uiConfighhhhhh");


  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    getProfile && getProfile();
  }, []);

  useEffect(() => {
    if (profile?.address) {
      setSelectedAddress(profile.address);
    }
  }, [profile]);

  /* ================= TOTAL ================= */

  // console.log(loyaltySettings,"loyaltySettingsjjhjhuohoi");
  


  

  const applyPoints = () => {

    if (!loyaltySettings?.enable_redeem) {
      Alert.alert("Redeem Disabled");
      return;
    }

    const pts = Number(pointsInput);

    if (!pts || pts <= 0) {
      Alert.alert("Enter valid points");
      return;
    }

    if (pts > availablePoints) {
      Alert.alert(
        "Insufficient Points",
        `You only have ${availablePoints} points`
      );
      return;
    }

    if (pts < loyaltySettings.min_redeem_points) {
      Alert.alert(
        "Minimum Points",
        `Minimum redeem is ${loyaltySettings.min_redeem_points}`
      );
      return;
    }

    if (pts > maxRedeemablePoints) {
      Alert.alert(
        "Max Redeem Limit",
        `You can redeem maximum ${maxRedeemablePoints} points`
      );
      return;
    }

    const discountValue =
      pts * Number(loyaltySettings.point_value || 1);

    setAppliedPoints(pts);
    setPointsDiscount(discountValue);
  };

  const removePoints = () => {
    setAppliedPoints(null);
    setPointsDiscount(0);
    setPointsInput("");
  };

  const total = useMemo(() => {

    let sum = 0;

    cartItems.forEach((i) => {
      sum += Number(i.total || 0);
    });

    const finalTotal = sum - discount - pointsDiscount;

    return finalTotal > 0 ? finalTotal.toFixed(2) : "0.00";

  }, [cartItems, discount, pointsDiscount]);

  
  
  
  const subtotal = useMemo(() => {
    let sum = 0;
    cartItems.forEach(i => {
      sum += Number(i.total || 0);
    });
    return sum;
  }, [cartItems]);

    const maxRedeemablePoints = useMemo(() => {

    if (!loyaltySettings) return 0;

    const maxRedeemPercentage = Number(loyaltySettings?.max_redeem_percentage || 0);
    const pointValue = Number(loyaltySettings?.point_value || 1);
    const maxRedeemPoints = Number(loyaltySettings?.max_redeem_points || 0);
    const userPoints = Number(availablePoints || 0);

    const percentLimit = (subtotal * maxRedeemPercentage) / 100;

    const percentPoints = percentLimit / pointValue;

    const maxPoints = Math.min(
      userPoints,
      maxRedeemPoints,
      percentPoints
    );

    return Math.floor(maxPoints);

  }, [subtotal, availablePoints, loyaltySettings]);

  // console.log(maxRedeemablePoints,"maxRedeemablePoints");

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
  };

  /* ================= CREATE ORDER ================= */

const createOrder = async (orderType) => {
  // console.log(cartItems,"cartItemsv");
  try {
    setLoading(true);

    const res = await fetch(
      "https://api.rmtechsolution.com/create_order.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(total),
          merchant_id: merchantData?.merchantId,
          keyId: merchantData?.keyId,
          keySecret: merchantData?.keySecret,
          user_id: user?.id,
          phone: user?.phone,
          items: cartItems,
          orderType: orderType,
          couponDiscount: discount || 0,
          pointsDiscount: pointsDiscount || 0,
          address: JSON.stringify(selectedAddress || {})
        })
      }
    );

    const order = await res.json();

    // console.log("ORDER RESPONSE:", order);

    if (!order?.success) {
      Alert.alert("Order Error", order?.message || "Order failed");
      return;
    }

    /* ================= COD ================= */

    if (orderType === "COD") {

      clearCart();
      getCart();
      
      Alert.alert("Order Placed", "Cash on Delivery selected");
      
      setShowPaymentModal(false)
      navigation.navigate("OrderHistoryContainer");

      return; // 🔴 IMPORTANT
    }

    /* ================= ONLINE ================= */

    const orderId = order.id;

    const options = {
      key: order.key,
      order_id: orderId,
      amount: Number(order.amount),
      currency: order.currency,
      name: merchantData?.name || "RM Tech Solution",
      description: "Order Payment",
      prefill: {
        contact: String(user?.phone || ""),
        name: user?.name || "Customer",
        email: user?.email || ""
      },
      theme: { color: "#FF8C00" }
    };

    let paymentResponse = null;

    try {
      paymentResponse = await RazorpayCheckout.open(options);
    } catch (err) {
      console.log("Razorpay error:", err);

      if (err?.razorpay_payment_id) {
        paymentResponse = err;
      }
    }

    if (paymentResponse?.razorpay_payment_id) {

      await fetch(
        "https://api.rmtechsolution.com/create_order.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            payment_id: paymentResponse.razorpay_payment_id,
            merchant_id: merchantData?.merchantId,
            user_id: user?.id,
            phone: user?.phone,
            items: cartItems,
            address: JSON.stringify(selectedAddress || {}),
            amount: Number(total),
            orderType: "online",
            couponDiscount: discount || 0,
            pointsDiscount: pointsDiscount || 0,
            status: "success"
          })
        }
      );

      clearCart();
      getCart();
      Alert.alert("Success", "Payment successful");
      setShowPaymentModal(false)
      navigation.navigate("OrderHistoryContainer");

    } else {

      await fetch(
        "https://api.rmtechsolution.com/create_order.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            merchant_id: merchantData?.merchantId,
            user_id: user?.id,
            phone: user?.phone,
            items: cartItems,
            address: JSON.stringify(selectedAddress || {}),
            amount: Number(total),
            orderType: "online",
            couponDiscount: discount || 0,
            pointsDiscount: pointsDiscount || 0,
            status: "failure"
          })
        }
      );

      Alert.alert("Payment Cancelled");
    }

  } catch (e) {
    console.log("ORDER ERROR:", e);
    Alert.alert("Error", e?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  /* ================= CART ITEM ================= */

  const renderItem = ({ item }) => {

    const imageUrl = Array.isArray(item.images)
      ? item.images[0]
      : item.images;

      // console.log(item,"itemitemitemjjjbkjkg");
      

    return (
      <>
    
      <View style={styles.itemCard}>
        <View style={{ flexDirection: "row", flex: 1 }}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.item_name}</Text>

            {item.variant_name && (
              <Text style={{ fontSize: 12, color: "#888" }}>
                {item.variant_name}
              </Text>
            )}

            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.cart_id, "dec")}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{item.quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.cart_id, "inc")}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
          <Text style={styles.price}>₹{item.total}</Text>
          <TouchableOpacity onPress={() => deleteCartItem(item.cart_id)}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
      </>
    );
  };

  /* ================= UI ================= */

  return (
    <>
    <StatusBar barStyle="light-content"/>
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={uiConfig?.headerTextColor || "#fff"} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(i) => i.cart_id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />

          {/* ADDRESS SECTION */}
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.addressTitle}>Delivery Address</Text>

                <TouchableOpacity onPress={() => setSelectedAddress(null)}>
                  <Text style={{ color: uiConfig?.cardTextColor || "#E50914" }}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>
                {selectedAddress.building}, {selectedAddress.doorNo}
              </Text>
              <Text style={styles.addressText}>{selectedAddress.street}</Text>
              <Text style={styles.addressText}>
                {selectedAddress.city} - {selectedAddress.pincode}
              </Text>
              <Text style={styles.addressText}>{selectedAddress.state}</Text>
            </View>
          ) : (
            <AddAddressComponent
              onSave={(data) => {
                setSelectedAddress(data);
                saveUserAddress && saveUserAddress(data);
                getProfile && getProfile();
                Alert.alert("Address Saved");
              }}
              getProfile={getProfile}
              uiConfig={addressUiConfig}
            />
          )}

          {/* BOTTOM */}
          <View style={styles.bottom}>
            <Text style={styles.total}>₹{total}</Text>

            <TouchableOpacity
              style={styles.payBtn}
              disabled={loading}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.payText}>
                {loading ? "Processing..." : `Pay ₹${total}`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* PAYMENT MODAL */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentSheet}>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons
                  name="close"
                  size={22}
                  color={uiConfig?.cardTextColor || "#fff"}
                />
              </TouchableOpacity>
            </View>

            {/* ===== COUPON SECTION ===== */}
            {/* ===== REDEEM POINTS ===== */}

            <View style={styles.couponContainer}>

              {appliedPoints ? (
                <View style={styles.couponRowBetween}>
                  <View>
                    <Text style={styles.couponTitle}>Points Applied</Text>
                    <Text style={styles.couponAppliedText}>
                      {appliedPoints} Points
                    </Text>
                  </View>

                  <TouchableOpacity onPress={removePoints}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.couponTitle}>
                    Redeem Points (Available Points: {availablePoints})
                  </Text>

                  <Text style={{ fontSize: 12, color: "#aaa", marginBottom: 3 }}>
                    Max Redeemable: {loyaltySettings?.max_redeem_points} points or {loyaltySettings?.max_redeem_percentage}% of your order value
                  </Text>

                  <View style={styles.couponRow}>
                    <TextInput
                      placeholder="Enter points"
                      placeholderTextColor="#999"
                      value={pointsInput}
                      keyboardType="numeric"
                      onChangeText={setPointsInput}
                      style={styles.couponInput}
                    />

                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={applyPoints}
                    >
                      <Text style={styles.applyText}>Redeem</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

            </View>


            <View style={styles.couponContainer}>

              {appliedCoupon ? (
                <View style={styles.couponRowBetween}>
                  <View>
                    <Text style={styles.couponTitle}>Coupon Applied</Text>
                    <Text style={styles.couponAppliedText}>
                      {appliedCoupon}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={removeCoupon}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.couponTitle}>
                    Have a coupon?
                  </Text>

                  <View style={styles.couponRow}>
                    <TextInput
                      placeholder="Enter code"
                      placeholderTextColor="#999"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      style={styles.couponInput}
                    />

                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={async () => {

                        const res = await apply_coupon(
                          couponCode,
                          subtotal
                        );

                        if (res?.success) {
                          setDiscount(res.discount);
                          setAppliedCoupon(couponCode);
                        } else {
                          Alert.alert("Coupon Error", res?.message || "Invalid coupon");
                        }

                      }}
                    >
                      <Text style={styles.applyText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* ===== PAYMENT OPTIONS ===== */}

            {enableOnline == true || enableOnline == "true" && <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "online" && styles.activeOption
              ]}
              onPress={() => setPaymentMethod("online")}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={[styles.optionText, , paymentMethod === "online" && styles.activeOptionText]}>Pay Online</Text>
                  <Text style={styles.optionAmount}>₹{total}</Text>
                </View>
                <View>
                  {paymentMethod === "online" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="green"
                      style={{ marginLeft: 8 }}
                    />
                  )}</View>
              </View>
            </TouchableOpacity>}

            {enableCOD == true || enableCOD == "true" && <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "COD" && styles.activeOption
              ]}
              onPress={() => setPaymentMethod("COD")}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={[styles.optionText, , paymentMethod === "COD" && styles.activeOptionText]}>Cash on Delivery</Text>
                  <Text style={styles.optionAmount}>₹{total}</Text>
                </View>
                <View>
                  {paymentMethod === "COD" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="green"
                      style={{ marginLeft: 8 }}
                    />
                  )}</View>
              </View>
            </TouchableOpacity>}

            {/* ===== PRICE BREAKDOWN ===== */}

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
              </View>

              {discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: "green" }]}>
                    Coupon Discount
                  </Text>
                  <Text style={[styles.priceValue, { color: "green" }]}>
                    -₹{discount}
                  </Text>
                </View>
              )}
              {pointsDiscount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: "green" }]}>
                    Points Discount
                  </Text>
                  <Text style={[styles.priceValue, { color: "green" }]}>
                    -₹{pointsDiscount}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>

            {/* ===== CONTINUE ===== */}

            <TouchableOpacity
              style={[
                styles.continueBtn,
                !paymentMethod && styles.continueBtnDisabled
              ]}
              disabled={!paymentMethod}
              onPress={() => createOrder(paymentMethod)}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
};

export default CheckoutComponent;

/* ================= CMS STYLES ================= */

const createStyles = (ui) =>
  StyleSheet.create({

    /* ================= PAYMENT MODAL STYLES ================= */
    sheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    activeOptionText:{
      color: "#000",
    },

    /* ================= COUPON SECTION ================= */

    couponContainer: {
      borderWidth: .5,
      borderColor: "rgba(0,0,0,0.5)",
      padding: 14,
      borderRadius: 12,
      marginBottom: 18,
      backgroundColor: ui?.cardBgColor || "#2A2A2A",
    },

    couponRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    couponRowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    couponTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: ui?.cardTextColor || "#fff",
    },

    couponAppliedText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FF8C00",
    },

    removeText: {
      color: "#E53935",
      fontWeight: "600",
    },

    couponInput: {
      flex: 1,
      borderWidth: 2,
      borderColor: "#DDD",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginRight: 10,
      backgroundColor: "#fff",
    },

    applyBtn: {
      backgroundColor: ui?.payButtonColor || "#E50914",
      paddingHorizontal: 16,
      justifyContent: "center",
      borderRadius: 8,
      padding: 8
    },

    applyText: {
      color: "#fff",
      fontWeight: "600",
    },

    /* ================= PAYMENT OPTIONS ================= */

    activeOption: {
      borderColor: "#FF8C00",
      backgroundColor: "#FFF4E5",
    },

    optionText: {
      fontSize: 16,
      fontWeight: "600",
      color: ui?.cardTextColor || "#fff",
    },

    optionAmount: {
      fontSize: 16,
      fontWeight: "700",
      color:ui?.priceColor || "#E50914",
    },

    /* ================= PRICE BREAKDOWN ================= */

    priceContainer: {
      backgroundColor: ui?.cardBgColor || "#2A2A2A",
      padding: 15,
      borderRadius: 12,
      marginTop: 10,
      marginBottom: 18,
      borderColor: "rgba(0,0,0,0.5)",
      borderWidth: .5,
    },

    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },

    priceLabel: {
      fontSize: 14,
      color: ui?.cardTextColor || "#fff",
    },

    priceValue: {
      fontSize: 14,
      fontWeight: "600",
      color: ui?.priceColor || "#E50914",
    },

    divider: {
      height: 1,
      backgroundColor: "#E5E5E5",
      marginVertical: 8,
    },

    totalLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: ui?.cardTextColor || "#fff",
    },

    totalValue: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.priceColor || "#E50914",
    },

    /* ================= CONTINUE BUTTON ================= */

    continueBtn: {
      backgroundColor: ui?.payButtonColor || "#E50914",
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },

    continueBtnDisabled: {
      opacity: 0.5,
    },

    continueText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    // 

    container: {
      flex: 1,
      backgroundColor: ui?.pageBgColor || "#111",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: ui?.headerBgColor || "#000",
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.headerTextColor || "#fff",
    },
    itemCard: {
      backgroundColor: ui?.cardBgColor || "#1A1A1A",
      margin: 12,
      padding: 16,
      borderRadius: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)"
    },
    name: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700",
    },
    price: {
      color: ui?.priceColor || "#E50914",
      fontWeight: "800",
    },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    qtyBtn: {
      backgroundColor: ui?.qtyButtonColor || "#E50914",
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyBtnText: {
      color: ui?.qtyButtonTextColor || "#fff",
      fontWeight: "800",
    },
    qtyValue: {
      marginHorizontal: 10,
      color: ui?.cardTextColor || "#fff",
    },
    productImage: {
      width: 70,
      height: 70,
      borderRadius: 12,
      marginRight: 12,
    },
    addressCard: {
      backgroundColor: ui?.cardBgColor || "#1A1A1A",
      margin: 16,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)"
    },
    addressTitle: {
      color: ui?.cardTextColor || "#E50914",
      fontWeight: "800",
    },
    addressText: {
      color: ui?.cardTextColor || "#ddd",
      marginTop: 4,
    },
    bottom: {
      padding: 20,
      backgroundColor: ui?.bottomBarColor || "#000",
    },
    total: {
      color: ui?.cardTextColor || "#fff",
      fontSize: 18,
      fontWeight: "800",
    },
    payBtn: {
      backgroundColor: ui?.payButtonColor || "#E50914",
      padding: 16,
      borderRadius: 14,
      marginTop: 10,
      alignItems: "center",
    },
    payText: {
      color: ui?.payButtonTextColor || "#fff",
      fontWeight: "800",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    paymentSheet: {
      backgroundColor: ui?.sheetBgColor || "#1A1A1A",
      padding: 20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.cardTextColor || "#fff",
      marginBottom: 15,
    },
    paymentOption: {
      padding: 15,
      borderRadius: 12,
      backgroundColor: ui?.cardBgColor || "#2A2A2A",
      marginBottom: 10,
      borderWidth: .5,
      borderColor: "rgba(0,0,0,0.5)",
    },
    optionText: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: "#999",
      fontSize: 16,
    },
  });