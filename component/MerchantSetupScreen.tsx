import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useMerchantStore from "../store/useMerchantStore";

const MERCHANT_LIST_URL = "https://api.rmtechsolution.com/getMerchant?";

interface MerchantSetupScreenProps {
  navigation: any;
}

interface MerchantItem {
  merchantId: number;
  merchantName: string;
  status: string;
  merchantLogo?: string;
  merchantLocation?: string;
}

const MerchantSetupScreen: React.FC<MerchantSetupScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [brokenImageMap, setBrokenImageMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { setMerchant } = useMerchantStore();

  const fallbackMerchantIcon = require("../assets/adaptive-icon-rm.png");
  const rmLogo = require("../assets/adaptive-icon-rm.png");

  const mapMerchant = (item: any): MerchantItem | null => {
    const id = Number(item?.merchantId ?? item?.id ?? item?.merchant_id);
    const name = String(item?.name ?? item?.merchantName ?? item?.merchant_name ?? "").trim();
    const status = String(item?.status ?? "active").toLowerCase();

    if (!id || !name) {
      return null;
    }

    return {
      merchantId: id,
      merchantName: name,
      status,
      merchantLogo: item?.merchantLogo ?? item?.logo ?? item?.image,
      merchantLocation: item?.merchantLocation ?? item?.location ?? "",
    };
  };

  const fetchMerchants = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(MERCHANT_LIST_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const text = await response.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }

      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.merchants)
        ? data.merchants
        : Array.isArray(data)
        ? data
        : [];

      const parsed = rawList
        .map(mapMerchant)
        .filter((item: MerchantItem | null): item is MerchantItem => Boolean(item));

      if (!parsed.length) {
        setError("No merchants found right now.");
      }

      setMerchants(parsed);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const filteredMerchants = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return merchants.filter((merchant) => {
      const nameMatch = merchant.merchantName.toLowerCase().includes(query);
      const locationMatch = (merchant.merchantLocation || "").toLowerCase().includes(query);
      const matchesSearch = !query || nameMatch || locationMatch;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && merchant.status === "active") ||
        (statusFilter === "inactive" && merchant.status !== "active");

      return matchesSearch && matchesStatus;
    });
  }, [merchants, searchText, statusFilter]);

  const selectedMerchant = useMemo(
    () => merchants.find((item) => item.merchantId === selectedMerchantId) || null,
    [merchants, selectedMerchantId]
  );

  const handleSubmit = async () => {
    if (!selectedMerchantId) {
      setError("Please select a merchant to continue.");
      return;
    }

    if (!selectedMerchant) {
      setError("Selected merchant is not available. Please pick again.");
      return;
    }

    if (selectedMerchant.status !== "active") {
      setError("This merchant is currently inactive.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      setMerchant(selectedMerchant.merchantId, selectedMerchant.merchantName);
      navigation.replace("Splash");
    } catch {
      setSubmitting(false);
      setError("Unable to open merchant right now. Please try again.");
    }
  };

  const renderMerchantItem = ({ item }: { item: MerchantItem }) => {
    const isSelected = item.merchantId === selectedMerchantId;
    const isInactive = item.status !== "active";
    const useFallbackImage = !item.merchantLogo || brokenImageMap[item.merchantId];

    return (
      <Pressable
        disabled={isInactive}
        style={[
          styles.merchantCard,
          isSelected ? styles.merchantCardSelected : null,
          isInactive ? styles.merchantCardInactive : null,
        ]}
        onPress={() => {
          if (isInactive) {
            return;
          }

          setSelectedMerchantId(item.merchantId);
          if (error) setError("");
        }}
      >
        <View style={styles.merchantLeft}>
          <Image
            source={useFallbackImage ? fallbackMerchantIcon : { uri: item.merchantLogo }}
            style={styles.merchantLogo}
            resizeMode="cover"
            onError={() => {
              setBrokenImageMap((prev) => ({ ...prev, [item.merchantId]: true }));
            }}
          />

          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{item.merchantName}</Text>
            <Text style={styles.merchantLocation} numberOfLines={1}>
              {item.merchantLocation || `Merchant ID ${item.merchantId}`}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={13} color="#F4B400" />
              <Text style={styles.metaText}>4.5%</Text>
              <Text style={[styles.merchantStatus, isInactive ? styles.inactiveText : null]}>
                {isInactive ? "Inactive" : "Active"}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={isSelected ? "#2F6DF6" : "#A6AFB9"}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.8}
            >
            </TouchableOpacity>

            <Text style={styles.title}>Merchant Selection</Text>

            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#7B8794" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for listing"
              placeholderTextColor="#9AA5B1"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (error) setError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, statusFilter === "all" ? styles.filterChipActive : null]}
              onPress={() => setStatusFilter("all")}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, statusFilter === "all" ? styles.filterChipTextActive : null]}>All Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === "active" ? styles.filterChipActive : null]}
              onPress={() => setStatusFilter("active")}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, statusFilter === "active" ? styles.filterChipTextActive : null]}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === "inactive" ? styles.filterChipActive : null]}
              onPress={() => setStatusFilter("inactive")}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, statusFilter === "inactive" ? styles.filterChipTextActive : null]}>Inactive</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listWrap}>
            {loading ? (
              <View style={styles.stateWrap}>
                <ActivityIndicator size="large" color="#25D366" />
                <Text style={styles.stateText}>Loading merchants...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMerchants}
                keyExtractor={(item) => String(item.merchantId)}
                renderItem={renderMerchantItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
                ListEmptyComponent={
                  <View style={styles.stateWrap}>
                    <Text style={styles.stateText}>No merchants match your search.</Text>
                  </View>
                }
              />
            )}
          </View>

          <View
            style={[
              styles.footer,
              {
                paddingBottom:
                  Platform.OS === "android"
                    ? Math.max(insets.bottom, 16)
                    : Math.max(insets.bottom, 8),
              },
            ]}
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {Boolean(error) && !loading ? (
              <TouchableOpacity style={styles.retryBtn} onPress={fetchMerchants} activeOpacity={0.8}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                (!selectedMerchantId || loading || submitting) ? styles.buttonDisabled : null,
              ]}
              onPress={handleSubmit}
              disabled={!selectedMerchantId || loading || submitting}
              activeOpacity={0.9}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {selectedMerchant ? `Continue (ID: ${selectedMerchant.merchantId})` : "Continue"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {submitting ? (
        <View style={styles.transitionLoaderOverlay}>
          <Image source={rmLogo} style={styles.transitionLoaderLogo} resizeMode="contain" />
          <ActivityIndicator size="small" color="#111827" style={styles.transitionLoaderSpinner} />
          <Text style={styles.transitionLoaderText}>Opening merchant...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  header: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: 10,
    marginTop: 20,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111B21",
    letterSpacing: 0,
  },
  searchWrap: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E6EBF0",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#111B21",
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: "#C7D2FE",
    backgroundColor: "#EEF2FF",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterChipTextActive: {
    color: "#2F6DF6",
  },
  listWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 0,
    overflow: "hidden",
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 2,
    paddingBottom: 14,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginLeft: 64,
  },
  merchantCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingVertical: 11,
    borderRadius: 0,
    backgroundColor: "#FFFFFF",
  },
  merchantCardSelected: {
    backgroundColor: "#F7F9FD",
  },
  merchantCardInactive: {
    opacity: 0.65,
  },
  merchantLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  merchantLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF3F7",
    borderWidth: 1,
    borderColor: "#E6EDF3",
  },
  merchantInfo: {
    marginLeft: 10,
    flex: 1,
  },
  merchantName: {
    color: "#111B21",
    fontSize: 16,
    fontWeight: "700",
  },
  merchantLocation: {
    color: "#7A8A99",
    fontSize: 12,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  metaText: {
    marginLeft: 4,
    color: "#6A7785",
    fontSize: 11,
    fontWeight: "600",
  },
  merchantStatus: {
    marginLeft: 8,
    color: "#1B9E5A",
    fontSize: 11,
    fontWeight: "600",
  },
  inactiveText: {
    color: "#D64545",
  },
  stateWrap: {
    paddingVertical: 36,
    alignItems: "center",
  },
  stateText: {
    marginTop: 10,
    fontSize: 14,
    color: "#54656F",
  },
  errorText: {
    color: "#D64545",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  retryBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: "#111B21",
    fontWeight: "600",
  },
  footer: {
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#2F6DF6",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  transitionLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  transitionLoaderLogo: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  transitionLoaderSpinner: {
    marginTop: 16,
  },
  transitionLoaderText: {
    marginTop: 10,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MerchantSetupScreen;