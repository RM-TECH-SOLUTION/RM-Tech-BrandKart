import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "./AppNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import apiClient from '../api/apiClient';


type Nav = NativeStackNavigationProp<RootStackParamList>;

const CheckoutComponent = ({ route,cartResponse }) => {
  const navigation = useNavigation<Nav>();



  // 🛒 Mock cart or passed data
  const initialCart =
    route?.params?.cart || {
      1: 2,
      2: 1,
      3: 3,
    };

  const ITEMS = [
    {
      id: 1,
      name: "Roasted Cashew",
      price: "$5.99",
      image: "https://picsum.photos/300/300?roasted",
    },
    {
      id: 2,
      name: "Salted Cashew",
      price: "$4.99",
      image: "https://picsum.photos/300/300?salted",
    },
    {
      id: 3,
      name: "Spicy Cashew Mix",
      price: "$6.49",
      image: "https://picsum.photos/300/300?spicy",
    },
  ];

  const [cart, setCart] = useState(initialCart);

  const handleAdd = (id: number) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const handleRemove = (id: number) =>
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });

  // 🧮 Totals
  const { cartItems, subtotal, tax, total } = useMemo(() => {
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const found = ITEMS.find((i) => i.id === parseInt(id));
        if (found) {
          const price = parseFloat(found.price.replace("$", ""));
          return { ...found, qty, total: (qty * price).toFixed(2) };
        }
        return null;
      })
      .filter(Boolean) as any[];

    const sub = items.reduce((sum, i) => sum + parseFloat(i.total), 0);
    const taxAmt = sub * 0.05;
    const totalAmt = sub + taxAmt;

    return {
      cartItems: items,
      subtotal: sub.toFixed(2),
      tax: taxAmt.toFixed(2),
      total: totalAmt.toFixed(2),
    };
  }, [cart]);

  useEffect(() => {
  (async () => {
    try {
      const response = await apiClient.post(apiClient.Urls.getCart, {
        cart_Id: 12
      });

      // console.log("get cart response", response.data);
    } catch (error) {
      console.log("Error:", error);
    }
  })();
}, []);


// const handleCheckout = async () => {
//   try {
//     const amountInPaise = Math.round(parseFloat(total) * 100);

//     console.log("💰 Creating order for amount (in paise):", amountInPaise);

//     // 🔹 Step 1: Create Razorpay order from backend
//     const res = await fetch("http://192.168.68.161/api/auth/razorpay.php", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         action: "create_order",
//         amount: amountInPaise,
//       }),
//     });

//     const orderData = await res.json();
//     console.log("🔸 Razorpay order response:", orderData);

//     if (!orderData.id) {
//       Alert.alert("Error", "Failed to create Razorpay order");
//       return;
//     }

//     // 🔹 Step 2: Open Razorpay checkout
//     const options = {
//       description: "Payment for Cashew Products",
//       image: "https://picsum.photos/200/200?logo",
//       currency: "INR",
//       key: "rzp_test_RfB9T8TS7ruuZP", // ✅ Your Razorpay Test Key ID
//       amount: amountInPaise,
//       name: "Cashew Store",
//       order_id: orderData.id, // ✅ Must be passed exactly
//       prefill: {
//         email: "customer@example.com",
//         contact: "9876543210",
//         name: "John Doe",
//       },
//       theme: { color: "#FF8C00" },
//     };

//     console.log("⚙️ Opening Razorpay Checkout with options:", options);

//     const paymentData = await RazorpayCheckout.open(options);

//     console.log("✅ Razorpay payment success:", paymentData);

//     // 🔹 Step 3: Verify payment signature via backend
//     const verifyRes = await fetch("http://192.168.68.161/api/auth/razorpay.php", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         action: "verify_signature",
//         razorpay_order_id: paymentData.razorpay_order_id,
//         razorpay_payment_id: paymentData.razorpay_payment_id,
//         razorpay_signature: paymentData.razorpay_signature,
//       }),
//     });

//     const verifyResult = await verifyRes.json();
//     console.log("🔹 Verification response:", verifyResult);

//     if (verifyResult.success) {
//       Alert.alert("✅ Payment Verified", "Your payment was successful!");
//       navigation.navigate("SuccessScreen", {
//         paymentId: paymentData.razorpay_payment_id,
//       });
//     } else {
//       Alert.alert("⚠️ Verification Failed", "Invalid payment signature.");
//     }
//   } catch (error) {
//     console.error("❌ Payment error:", error);
//     Alert.alert("❌ Payment Cancelled", "Something went wrong or user cancelled payment.");
//   }
// };





  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleRemove(item.id)}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.qty}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleAdd(item.id)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemTotal}>${item.total}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container,{ paddingTop: StatusBar.currentHeight || 0 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* 🧡 Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checkout</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* 🛍️ Items */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 💰 Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (5%)</Text>
          <Text style={styles.summaryValue}>${tax}</Text>
        </View>
        <View style={styles.summaryRowTotal}>
          <Text style={styles.summaryLabelTotal}>Total</Text>
          <Text style={styles.summaryValueTotal}>${total}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          // onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>Pay ₹{total} with Razorpay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF8C00",
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 5,

  },
  backButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF8C00",
    marginLeft: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  qtyValue: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  summaryBox: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF8C00",
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: "#FF8C00",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
