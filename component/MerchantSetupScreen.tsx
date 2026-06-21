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
import { LinearGradient } from "expo-linear-gradient";
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
  const rmLogo = require("../assets/rmtechlogo.png");
  const bannerImage = require("../assets/banner.png");

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
      <View style={styles.merchantCardOuter}>
        <Pressable
          disabled={isInactive}
          style={[
            styles.merchantCard,
            isSelected && styles.merchantCardSelected,
            isInactive && styles.merchantCardInactive,
          ]}
          onPress={() => {
            if (isInactive) return;
            setSelectedMerchantId(item.merchantId);
            if (error) setError("");
          }}
        >
          <View style={styles.merchantCardBody}>
            <View style={styles.merchantCardLeft}>
              <View style={styles.merchantIconWrap}>
                <Image
                  source={fallbackMerchantIcon}
                  style={styles.merchantIcon}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName} numberOfLines={1}>
                  {item.merchantName}
                </Text>
                <Text style={styles.merchantCategory} numberOfLines={1}>
                  {item.merchantLocation || "Clothing"}
                </Text>
                <View style={styles.starsRow}>
                  <View style={styles.starIconsRow}>
                    {[1, 2, 3, 4].map((s) => (
                      <Ionicons key={s} name="star" size={13} color="#6D28D9" />
                    ))}
                    <Ionicons name="star-half" size={13} color="#C4B5FD" />
                  </View>
                  <Text style={styles.ratingText}>4.5/5</Text>
                </View>
              </View>
            </View>

            <View style={styles.merchantThumbWrap}>
              <Image
                source={useFallbackImage ? fallbackMerchantIcon : { uri: item.merchantLogo }}
                style={styles.merchantThumb}
                resizeMode="cover"
                onError={() => {
                  setBrokenImageMap((prev) => ({ ...prev, [item.merchantId]: true }));
                }}
              />
              <View style={[styles.statusBadge, isInactive && styles.statusBadgeInactive]}>
                <Text style={styles.statusBadgeText}>
                  {isInactive ? "CLOSED" : isSelected ? "NOW OPEN" : "OPEN"}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>

        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons name="checkmark" size={13} color="#FFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.wrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Navbar — rmtechlogo.png centered */}
          <View style={styles.navbar}>
            <Image
              source={rmLogo}
              style={styles.navbarLogo}
              resizeMode="cover"
            />
          </View>

          {/* Banner */}
          <View style={styles.bannerWrap}>
            <Image
              source={bannerImage}
              style={styles.banner}
              resizeMode="cover"
            />
          </View>

          {/* Section heading + search */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SELECT A MERCHANT</Text>
          </View>

          {/* Filter chips */}
          <View style={styles.filterRow}>
            {(["all", "active", "inactive"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                onPress={() => setStatusFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                  {f === "all" ? "All" : f === "active" ? "Active" : "Inactive"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores..."
              placeholderTextColor="#A0AEC0"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (error) setError("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={{ flex: 1 }}>
            {loading ? (
              <View style={styles.stateWrap}>
                <ActivityIndicator size="large" color="#6D28D9" />
                <Text style={styles.stateText}>Loading merchants...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMerchants}
                keyExtractor={(item) => String(item.merchantId)}
                renderItem={renderMerchantItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
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

            {selectedMerchant ? (
              <View style={styles.selectedBar}>
                <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                <Text style={styles.selectedBarText}>
                  SELECTED: <Text style={styles.selectedBarName}>{selectedMerchant.merchantName}</Text>
                  {selectedMerchant.merchantLocation ? (
                    <Text style={styles.selectedBarSub}> ({selectedMerchant.merchantLocation})</Text>
                  ) : null}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.buttonOuter,
                (!selectedMerchantId || loading || submitting) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedMerchantId || loading || submitting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#2E90FF", "#9B5CFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Continue  ›</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {submitting ? (
        <View style={styles.transitionLoaderOverlay}>
          <Image source={rmLogo} style={styles.transitionLoaderLogo} resizeMode="contain" />
          <ActivityIndicator size="small" color="#6D28D9" style={styles.transitionLoaderSpinner} />
          <Text style={styles.transitionLoaderText}>Opening merchant...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  wrapper: {
    flex: 1,
    paddingBottom: 12,
  },

  // ── Navbar ──────────────────────────────────────────────
  navbar: {
    backgroundColor: "#FFFFFF",
    paddingTop: 34,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  navbarLogo: {
    width: 150,
    height: 66,
  },

  // ── Banner ──────────────────────────────────────────────
  bannerWrap: {
    marginHorizontal: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
  },
  banner: {
    width: "100%",
    height: 120,
  },

  // ── Section heading ─────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.6,
  },

  // ── Filter chips ────────────────────────────────────────
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#EDE9FE",
    borderColor: "#8B5CF6",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#6D28D9",
  },

  // ── Search ──────────────────────────────────────────────
  searchWrap: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: "#111827",
    fontSize: 14,
    paddingVertical: 0,
  },

  // ── List ────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },

  // ── Merchant card ────────────────────────────────────────
  merchantCard: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "#C4B5FD",
    overflow: "hidden",
    minHeight: 100,
  },
  merchantCardOuter: {
    position: "relative",
    overflow: "visible",
  },
  merchantCardSelected: {
    backgroundColor: "#FAF5FF",
    borderColor: "#7C3AED",
  },
  merchantCardInactive: {
    opacity: 0.5,
  },

  merchantCardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  merchantCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 8,
  },

  // Left icon
  merchantIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  merchantIcon: {
    width: 34,
    height: 34,
  },

  // Center text
  merchantInfo: {
    flex: 1,
    paddingRight: 8,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1B46",
    marginBottom: 0,
    textTransform: "uppercase",
  },
  merchantCategory: {
    fontSize: 13,
    color: "#111827",
    marginTop: 2,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  starIconsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },

  // Right thumbnail + badge
  merchantThumbWrap: {
    position: "relative",
    width: 96,
    height: 100,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
    flexShrink: 0,
    alignSelf: "stretch",
    marginLeft: 0,
  },
  merchantThumb: {
    width: 96,
    height: 100,
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#DED6FF",
    paddingVertical: 7,
    alignItems: "center",
  },
  statusBadgeInactive: {
    backgroundColor: "#E5E7EB",
  },
  statusBadgeText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  checkmarkBadge: {
    position: "absolute",
    top: -12,
    right: -12,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // ── States ───────────────────────────────────────────────
  stateWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  stateText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    paddingTop: 6,
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  retryBtn: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  selectedBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  selectedBarText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  selectedBarName: {
    color: "#6D28D9",
    fontWeight: "700",
  },
  selectedBarSub: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  buttonOuter: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2E90FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Transition overlay ───────────────────────────────────
  transitionLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  transitionLoaderLogo: {
    width: 180,
    height: 60,
    marginBottom: 20,
  },
  transitionLoaderSpinner: {
    marginTop: 4,
  },
  transitionLoaderText: {
    marginTop: 14,
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default MerchantSetupScreen;