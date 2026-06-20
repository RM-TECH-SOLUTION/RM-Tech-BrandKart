import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useSessionStore from "../store/useSessionStore";

const { width } = Dimensions.get("window");

/* IMAGE NORMALIZER */
const getImageUri = (item) => {
  if (Array.isArray(item?.images) && item.images.length > 0)
    return item.images[0];
  if (Array.isArray(item?.image) && item.image.length > 0)
    return item.image[0];
  if (typeof item?.image === "string") return item.image;
  return null;
};

const CategoryListComponent = ({
  uiConfig = {},
  CATEGORIES = [],
  ITEMS = [],
  cartMap = {},
  totalItems = 0,
  totalPrice = "0.00",
  onSelectCategory,
  onAdd,
  onIncrease,
  onDecrease,
  loadingItems,
  mainCatalogues = [],
  cartItems
}) => {

  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMainCatalogue, setSelectedMainCatalogue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const isLoggedIn = useSessionStore((state) => state.isLoggedIn);


  const requireAuthBeforeAction = () => {
    if (isLoggedIn) return true;

    setAuthModalVisible(true);

    return false;
  };

  const [pdpVisible, setPdpVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showFullSpec, setShowFullSpec] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  // 

  const gridColumns = uiConfig?.gridColumns || 2;
  const gridGap = Number(uiConfig?.gridGap || 8);
  const gridHorizontalPadding = Number(uiConfig?.gridHorizontalPadding || 16);
  const modalGridGap = Number(uiConfig?.modalGridGap || gridGap);

  const CARD_WIDTH =
    (width - gridHorizontalPadding * 2 - (gridColumns - 1) * gridGap) / gridColumns;

  const dynamicStyles = styles(uiConfig, CARD_WIDTH, gridColumns);
  const pdpQty = cartMap[
    selectedVariant?.id
      ? `${selectedProduct?.id}_${selectedVariant?.id}`
      : `${selectedProduct?.id}`
  ]?.quantity || 0;

  /* ================= OPEN POPUP ================= */

  useEffect(() => {

    const t = setTimeout(() => {

      setModalVisible(true);
      setSelectedMainCatalogue(null);

    }, 300);

    return () => clearTimeout(t);

  }, []);

  /* ================= FILTER CATALOGS ================= */

  const filteredCatalogues = useMemo(() => {

    if (!selectedMainCatalogue) return [];

    return CATEGORIES.filter(
      (cat) =>
        Number(cat.main_catalogue_id) ===
        Number(selectedMainCatalogue.id)
    );

  }, [selectedMainCatalogue, CATEGORIES]);

  const getQty = (productId, variantId) => {

    const key = variantId
      ? `${productId}_${variantId}`
      : `${productId}`;

    return cartMap[key]?.quantity || 0;

  };

  /* ================= SELECT CATEGORY ================= */

  const handleSelectCategoryLocal = (cat) => {

    setSelectedCategory(cat);
    setModalVisible(false);

    onSelectCategory && onSelectCategory(cat.id);

  };

  /* ================= CATEGORY CARD ================= */

  const renderCategoryCard = (item) => (

    <TouchableOpacity
      style={[
        dynamicStyles.card,
        dynamicStyles.modalCard,
        { padding: 0 }
      ]}
      onPress={() => handleSelectCategoryLocal(item)}
    >

      {getImageUri(item) ? (
        <Image
          source={{ uri: getImageUri(item) }}
          style={[
            dynamicStyles.image,
            {
              backgroundColor: uiConfig?.imageBgColor || "#F9F9F9",
              marginBottom: 0,
            },
          ]}
        />
      ) : (
        <Image
          source={require("../assets/adaptive-icon-rm.png")}
          style={[
            dynamicStyles.image,
            {
              backgroundColor: uiConfig?.imageBgColor || "#F9F9F9",
              marginBottom: 0,
            },
          ]}
        />
      )}

      <Text style={dynamicStyles.cardText2}>
        {item.name}
      </Text>

    </TouchableOpacity>

  );

  /* ================= MAIN CATALOG CARD ================= */

  const renderMainCatalogCard = (item) => (

    <TouchableOpacity
      style={[
        dynamicStyles.card,
        dynamicStyles.modalCard,
        { padding: 0 }
      ]}
      onPress={() => setSelectedMainCatalogue(item)}
    >

      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={[
            dynamicStyles.image,
            {
              backgroundColor: uiConfig?.imageBgColor || "#F9F9F9",
              marginBottom: 0,
            },
          ]}
        />
      ) : (
        <Image
          source={require("../assets/adaptive-icon-rm.png")}
          style={[
            dynamicStyles.image,
            {
              backgroundColor: uiConfig?.imageBgColor || "#F9F9F9",
              marginBottom: 0,
            },
          ]}
        />
      )}

      <Text style={dynamicStyles.cardText2}>
        {item.name}
      </Text>

    </TouchableOpacity>

  );

  /* ================= ITEM CARD ================= */
  const getVariantInCart = (product) => {

    if (!product?.variants?.length) return null;

    const keys = Object.keys(cartMap);

    const productKeys = keys.filter(k =>
      k.startsWith(`${product.id}_`)
    );

    if (!productKeys.length) return product.variants[0];

    const lastKey = productKeys[productKeys.length - 1];

    const variantId = Number(lastKey.split("_")[1]);

    return product.variants.find(v => v.id === variantId);

  };

  const isItemInCart = (itemId) => {
    return cartItems?.some(c => Number(c.item_id) === Number(itemId));
  };

  const renderItemCard = (item) => {

    const activeVariant = getVariantInCart(item);
    const inCart = isItemInCart(item.id);

    const qty = getQty(
      item.id,
      activeVariant?.id || null
    );


    const isOutOfStock =
      item?.variants?.length > 0
        ? item.variants.every(v => v.stock === 0)
        : item.stock === 0;

    return (

      <View style={dynamicStyles.card}>

        {getImageUri(item) ? (

          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(item);
              const lastVariant = getVariantInCart(item);
              setSelectedVariant(lastVariant || item.variants[0]);
              setPdpVisible(true);
            }}
          >

            <Image
              source={{ uri: getImageUri(item) }}
              style={dynamicStyles.image}
            />

          </TouchableOpacity>

        ) : (
          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(item);
              const lastVariant = getVariantInCart(item);
              setSelectedVariant(lastVariant || item.variants[0]);
              setPdpVisible(true);
            }}
            style={dynamicStyles.image}
          >
            <Image
              source={require("../assets/adaptive-icon-rm.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 10, paddingBottom: 10 }}>

          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(item);
              const lastVariant = getVariantInCart(item);
              setSelectedVariant(lastVariant || item.variants[0]);
              setPdpVisible(true);
            }}
          >
            <Text numberOfLines={2} style={dynamicStyles.cardText}>
              {item.name}
            </Text>

            {item.stock && !isOutOfStock && (
              <Text
                style={{
                  fontSize: 11,
                  color: uiConfig?.mutedTextColor || "#A0AEC0",
                  marginTop: 4,
                }}
              >
                {item.stock} left
              </Text>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 }}>
              <Text style={{
                color: uiConfig?.priceColor || "#111827",
                fontSize: 15, 
                fontWeight: "800",
              }}>
                ₹{activeVariant?.price || item.price}
              </Text>
              {(activeVariant?.compare_price || item?.compare_price) && (
                <Text
                  style={{
                    color: uiConfig?.qtyBgColor || "#A0AEC0",
                    textDecorationLine: "line-through",
                    fontSize: 12,
                  }}
                >
                  ₹{activeVariant?.compare_price || item?.compare_price}
                </Text>
              )}
            </View>

            {/* Delivery badge */}
            {!isOutOfStock && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, backgroundColor: uiConfig?.deliveryBadgeBgColor || "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, width: "auto", alignSelf: "flex-start" }}>
                <Ionicons name="flash" size={12} color={uiConfig?.deliveryBadgeTextColor || "#92400E"} />
                <Text style={{ fontSize: 10, fontWeight: "600", color: uiConfig?.deliveryBadgeTextColor || "#92400E" }}>10 mins</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ marginTop: 8 }}>

            {isOutOfStock ? (

              <View style={[dynamicStyles.outOfStock, { backgroundColor: uiConfig?.outOfStockBgColor || "#E5E7EB" }]}>
                <Text style={[dynamicStyles.outText, { color: uiConfig?.outOfStockTextColor || "#667781" }]}>
                  OUT OF STOCK
                </Text>
              </View>

            ) : qty === 0 ? (

              <TouchableOpacity
                style={dynamicStyles.addButton}
                onPress={() => {
                  if (!requireAuthBeforeAction()) return;

                  setSelectedProduct(item);
                  const lastVariant = getVariantInCart(item);
                  setSelectedVariant(lastVariant || item?.variants?.[0] || null);
                  setPdpVisible(true);
                }}
              >
                <Ionicons name="add" size={18} color={uiConfig?.buttonTextColor || "#fff"} />
                <Text style={dynamicStyles.addButtonText}>
                  {inCart ? "ADD MORE" : "ADD"}
                </Text>
              </TouchableOpacity>

            ) : (

              <View style={dynamicStyles.qtyContainer}>

                <TouchableOpacity
                  style={dynamicStyles.qtyButton}
                  onPress={() => {
                    if (!requireAuthBeforeAction()) return;
                    onDecrease({
                      ...item,
                      variant: activeVariant
                    });
                  }}
                >
                  <Ionicons name="remove" size={16} color={uiConfig?.buttonColor || "#10B981"} />
                </TouchableOpacity>

                <Text style={dynamicStyles.qtyValue}>
                  {qty}
                </Text>

                <TouchableOpacity
                  style={dynamicStyles.qtyButton}
                  onPress={() => {
                    if (!requireAuthBeforeAction()) return;
                    onIncrease({
                      ...item,
                      variant: activeVariant
                    });
                  }}
                >
                  <Ionicons name="add" size={16} color={uiConfig?.buttonColor || "#10B981"} />
                </TouchableOpacity>

              </View>

            )}

          </View>

        </View>
      </View>

    );

  };
  return (

    <View style={dynamicStyles.container}>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: uiConfig?.borderColor || "#F0F0F0",
        }}
      >
        <Text style={dynamicStyles.headerTitle}>
          {uiConfig?.headerTitle || "Quick Commerce"}
        </Text>
      </View>

      {/* ================= SELECTED CATEGORY ================= */}

      {!selectedCategory ? (

        <Text style={dynamicStyles.selectText}>
          Please select a category...
        </Text>

      ) : (

        <>

          <TouchableOpacity
            style={dynamicStyles.selectedBox}
            onPress={() => setModalVisible(true)}
          >

            <Text style={dynamicStyles.selectedLabel}>
              {selectedCategory.name}
            </Text>

            <Text style={dynamicStyles.changeText}>
              Change
            </Text>

          </TouchableOpacity>

          <FlatList
            data={ITEMS}
            keyExtractor={(i) => i.id.toString()}
            numColumns={gridColumns}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: gridGap,
              paddingHorizontal: gridHorizontalPadding,
            }}
            renderItem={({ item }) => renderItemCard(item)}
            contentContainerStyle={{
              paddingBottom: 120,
              paddingTop: 4,
            }}
          />

        </>

      )}

      {/* ================= CART BAR ================= */}

      {uiConfig?.enableFloatingCart && totalItems > 0 && (

        <View style={dynamicStyles.cartContainer}>

          <TouchableOpacity
            style={dynamicStyles.cartButton}
            onPress={() => navigation.navigate("Checkout")}
          >

            <Text style={dynamicStyles.cartText}>
              View Cart ({totalItems}) - ₹{totalPrice}
            </Text>

          </TouchableOpacity>

        </View>

      )}


      {/* ================= SELECT CATALOG MODAL ================= */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={dynamicStyles.selectModalOverlay}>
          <View style={dynamicStyles.selectModalBox}>
            <Text style={dynamicStyles.modalTitle}>
              Select Catalog
            </Text>

            {/* If mainCatalogues is not present or empty, skip to catalog selection */}
            {(!mainCatalogues || mainCatalogues.length === 0) ? (
              <FlatList
                data={CATEGORIES}
                keyExtractor={(i) => i.id.toString()}
                numColumns={gridColumns}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  marginBottom: modalGridGap,
                }}
                renderItem={({ item }) => renderCategoryCard(item)}
                contentContainerStyle={dynamicStyles.modalListContent}
              />
            ) : (
              <>
                {/* MAIN CATALOGUES */}
                {!selectedMainCatalogue && (
                  <FlatList
                    data={mainCatalogues}
                    keyExtractor={(i) => i.id.toString()}
                    numColumns={gridColumns}
                    columnWrapperStyle={{
                      justifyContent: "space-between",
                      marginBottom: modalGridGap,
                    }}
                    renderItem={({ item }) => renderMainCatalogCard(item)}
                    contentContainerStyle={dynamicStyles.modalListContent}
                  />
                )}

                {/* CATALOG MODELS */}
                {selectedMainCatalogue && (
                  <>
                    <TouchableOpacity
                      onPress={() => setSelectedMainCatalogue(null)}
                      style={{ marginBottom: 20, padding: 5 }}
                    >
                      <Text style={{ color: uiConfig?.headerTitleColor || "#fff", fontWeight: "600" }}>
                        ← Back
                      </Text>
                    </TouchableOpacity>
                    <FlatList
                      data={filteredCatalogues}
                      keyExtractor={(i) => i.id.toString()}
                      numColumns={gridColumns}
                      columnWrapperStyle={{
                        justifyContent: "space-between",
                        marginBottom: modalGridGap,
                      }}
                      renderItem={({ item }) => renderCategoryCard(item)}
                      contentContainerStyle={dynamicStyles.modalListContent}
                    />
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={authModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={dynamicStyles.authOverlay}>
          <View style={dynamicStyles.authModalCard}>
            <Text style={dynamicStyles.authModalTitle}>Login Required</Text>
            <Text style={dynamicStyles.authModalMessage}>
              Please sign in or register to add items to your cart.
            </Text>

            <View style={dynamicStyles.authActionRow}>
              <TouchableOpacity
                style={dynamicStyles.authCancelBtn}
                onPress={() => setAuthModalVisible(false)}
              >
                <Text style={dynamicStyles.authCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={dynamicStyles.authLoginBtn}
                onPress={() => {
                  setPdpVisible(false);
                  setAuthModalVisible(false);
                  navigation.navigate("Auth");
                }}
              >
                <Text style={dynamicStyles.authLoginText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={pdpVisible} transparent animationType="slide" >


        <View style={[dynamicStyles.modalOverlay, { bottom: 0, justifyContent: "flex-end" }]}>


          <View style={[dynamicStyles.modalBox2, {
            borderRadius: 24,
            padding: 16, height: "100%",
            backgroundColor: uiConfig?.modalBgColor || "#0F0F0F",
            bottom: 0
          }]}>

            {/* BACK BUTTON */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                marginTop: 30
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPdpVisible(false);
                  setShowFullSpec(false);
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: uiConfig?.buttonColor,
                }}
              >
                <Text style={{ color: uiConfig?.buttonTextColor || "#fff", fontWeight: "700" }}>
                  ← Back
                </Text>
              </TouchableOpacity>
            </View>


            {selectedProduct && (

              <FlatList
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                data={[selectedProduct]}
                keyExtractor={() => "pdp"}
                renderItem={() => {

                  const specText = selectedProduct.specifications || "";
                  const shortSpec = specText.substring(0, 220);
                  const qty = cartMap[selectedProduct?.id]?.quantity || 0;

                  return (

                    <View style={{}}>

                      {/* IMAGE SLIDER */}
                      <FlatList
                        data={selectedProduct.images || []}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(img, i) => i.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                              setActiveImage(item);
                              setImageViewerVisible(true);
                            }}
                          >
                            <Image
                              source={{ uri: item }}
                              style={{
                                width: width - 90,
                                height: 340,
                                borderRadius: 16,
                                marginRight: 10
                              }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        )}
                      />

                      {/* TITLE */}
                      <Text style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: uiConfig?.modalTitleColor || "#fff",
                        marginTop: 10
                      }}>
                        {selectedProduct.name}
                      </Text>

                      {/* BRAND */}
                      {selectedProduct.brand && (
                        <Text style={{ color: uiConfig?.modalTitleColor || "#fff", marginTop: 4 }}>
                          {selectedProduct.brand}
                        </Text>
                      )}

                      {/* PRICE */}
                      <View style={{ flexDirection: "row", marginTop: 6 }}>

                        <Text style={{
                          color: uiConfig?.priceColor || "#E50914",
                          fontSize: 18,
                          fontWeight: "700"
                        }}>
                          ₹{selectedVariant?.price || selectedProduct.price}
                        </Text>


                        {(selectedVariant?.compare_price || selectedProduct.compare_price) && (

                          <Text style={{
                            marginLeft: 10,
                            color: uiConfig?.qtyBgColor || "#888",
                            textDecorationLine: "line-through"
                          }}>
                            ₹{selectedVariant?.compare_price || selectedProduct.compare_price}

                          </Text>

                        )}

                      </View>
                      <Text style={{ color: uiConfig?.qtyBgColor || "#fff" }}>Stock-{selectedVariant?.stock || selectedProduct?.stock}</Text>


                      {selectedProduct.variants?.length > 0 && (

                        <View style={{ marginTop: 16 }}>

                          <Text style={{
                            color: uiConfig?.modalTitleColor || "#fff",
                            fontWeight: "700",
                            marginBottom: 8
                          }}>
                            Select Variant
                          </Text>

                          <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={selectedProduct.variants}
                            keyExtractor={(v) => v.id.toString()}
                            renderItem={({ item }) => {

                              const isStock = item.stock > 0;
                              const active = selectedVariant?.id === item.id;


                              return (
                                <>
                                  <TouchableOpacity
                                    disabled={!isStock}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 14,
                                      borderRadius: 12,
                                      marginRight: 10,
                                      borderWidth: 2,
                                      borderColor: active ? uiConfig?.buttonColor || "#E50914" : "#444",
                                      backgroundColor: !isStock
                                        ? "#333"
                                        : active
                                          ? uiConfig?.buttonColor || "#E50914"
                                          : "gray",
                                      opacity: isStock ? 1 : 0.5
                                    }}
                                    onPress={() => isStock && setSelectedVariant(item)}
                                  >
                                    <Text style={{ color: uiConfig?.buttonTextColor || "#fff" }}>
                                      {item.variant_name}
                                      {!isStock ? " (Out)" : ""}
                                    </Text>
                                  </TouchableOpacity>

                                </>

                              )

                            }}
                          />

                        </View>

                      )}

                      {/* SPECIFICATIONS */}
                      {specText.length > 0 && (

                        <View style={{ marginTop: 16 }}>

                          <Text style={{
                            color: uiConfig?.modalTitleColor || "#fff",
                            fontWeight: "700",
                            marginBottom: 6
                          }}>
                            Specifications
                          </Text>

                          <Text style={{
                            color: uiConfig?.modalTitleColor || "#aaa",
                            fontSize: 13,
                            lineHeight: 20
                          }}>
                            {showFullSpec ? specText : shortSpec}
                          </Text>

                          {specText.length > 220 && (

                            <TouchableOpacity
                              onPress={() => setShowFullSpec(!showFullSpec)}
                            >

                              <Text style={{
                                color: uiConfig?.buttonColor || "#E50914",
                                marginTop: 6,
                                fontWeight: "600"
                              }}>
                                {showFullSpec ? "See Less" : "See More"}
                              </Text>

                            </TouchableOpacity>

                          )}

                        </View>

                      )}

                    </View>

                  )

                }}
              />

            )}

            {/* FIXED ADD TO CART */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 15,
                backgroundColor: uiConfig?.modalBgColor || "#111"
              }}
            >

              <TouchableOpacity
                style={{
                  backgroundColor: uiConfig?.buttonColor || "#E50914",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  marginBottom: 20
                }}
                onPress={() => {

                  if (!requireAuthBeforeAction()) return;
                  if (selectedVariant?.stock === 0) return;

                  const cartKey = selectedVariant?.id
                    ? `${selectedProduct?.id}_${selectedVariant?.id}`
                    : `${selectedProduct?.id}`;

                  if (pdpQty === 0) {

                    onAdd &&
                      onAdd({
                        ...selectedProduct,
                        variant: selectedVariant,
                        cartKey
                      });

                  } else {

                    onIncrease &&
                      onIncrease({
                        ...selectedProduct,
                        variant: selectedVariant,
                        cartKey
                      });

                  }

                  setPdpVisible(false);
                  setShowFullSpec(false);

                }}
              >

                <Text style={{
                  color: uiConfig?.buttonTextColor || "#fff",
                  fontWeight: "800"
                }}>
                  {selectedVariant?.stock === 0
                    ? "OUT OF STOCK"
                    : pdpQty === 0
                      ? "ADD TO CART"
                      : "ADD MORE"}

                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>
      <Modal visible={imageViewerVisible} transparent animationType="fade">

        <View style={{
          flex: 1,
          backgroundColor: uiConfig?.imageViewerBgColor || "#000",
          justifyContent: "center",
          alignItems: "center"
        }}>

          <Image
            source={{ uri: activeImage }}
            style={{
              width: "100%",
              height: "80%"
            }}
            resizeMode="contain"
          />

          <TouchableOpacity
            onPress={() => setImageViewerVisible(false)}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: 10,
              borderRadius: 20
            }}
          >

            <Text style={{ color: uiConfig?.buttonTextColor || "#fff", fontSize: 16 }}>Close</Text>

          </TouchableOpacity>

        </View>

      </Modal>
    </View>

  );

};

export default CategoryListComponent;

/* ================= STYLES ================= */

const styles = (ui, CARD_WIDTH, gridColumns = 2) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: ui?.pageBgColor || "#FFFFFF",
      paddingHorizontal: 0,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: ui?.headerTitleColor || "#111827",
      marginVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
    },

    selectText: {
      textAlign: "center",
      color: ui?.mutedTextColor || "#A0AEC0",
      marginTop: 80,
      fontSize: 14,
    },

    selectedBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: ui?.selectedBgColor || "#F0FDF4",
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: ui?.buttonColor || "#10B981",
    },

    selectedLabel: {
      color: ui?.buttonColor || "#10B981",
      fontWeight: "700",
      fontSize: 14,
    },

    changeText: {
      color: ui?.buttonColor || "#10B981",
      fontWeight: "600",
      fontSize: 12,
    },

    card: {
      width: CARD_WIDTH,
      backgroundColor: ui?.cardBgColor || "#FFFFFF",
      borderRadius: 12,
      padding: 0,
      marginBottom: 0,
      borderWidth: 1,
      borderColor: ui?.borderColor || "#F0F0F0",
      overflow: "hidden",
    },

    modalCard: {
      width: `${Math.max(45, Math.floor(100 / gridColumns) - 3)}%`,
    },

    modalListContent: {
      paddingBottom: Number(ui?.modalGridGap || ui?.gridGap || 8),
    },

    image: {
      width: "100%",
      height: CARD_WIDTH - 20,
      borderRadius: 0,
      marginBottom: 0,
      resizeMode: "cover",
      backgroundColor: ui?.imageBgColor || "#F9F9F9",
    },

    cardText: {
      color: ui?.cardTextColor || "#111827",
      fontWeight: "600",
      fontSize: 13,
      marginTop: 6,
      paddingHorizontal: 8,
      lineHeight: 15,
    },

    cardText2: {
      color: ui?.cardTextColor || "#111827",
      fontWeight: "700",
      textAlign: "center",
      fontSize: 13,
      padding: 10,
    },

    priceText: {
      color: ui?.mutedTextColor || "#A0AEC0",
      marginTop: 4,
    },

    addButton: {
      backgroundColor: ui?.buttonColor || "#10B981",
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 6,
      marginHorizontal: 8,
      marginBottom: 8,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },

    addButtonText: {
      color: ui?.buttonTextColor || "#FFFFFF",
      fontWeight: "700",
      fontSize: 13,
    },

    outOfStock: {
      backgroundColor: ui?.outOfStockBgColor || "#E5E7EB",
      paddingVertical: 8,
      borderRadius: 8,
      marginHorizontal: 0,
      marginBottom: 0,
      alignItems: "center",
    },

    outText: {
      color: ui?.outOfStockTextColor || "#667781",
      fontWeight: "700",
      fontSize: 12,
    },

    qtyContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: ui?.cardBgColor || "#FFFFFF",
      borderRadius: 8,
      paddingVertical: 5,
      paddingHorizontal: 8,
      marginTop: 6,
      marginHorizontal: 8,
      marginBottom: 8,
      borderWidth: 1.5,
      borderColor: ui?.buttonColor || "#10B981",
    },

    qtyButton: {
      backgroundColor: "transparent",
      width: 24,
      height: 24,
      borderRadius: 6,
      justifyContent: "center",
      alignItems: "center",
    },

    qtyText: {
      color: ui?.buttonColor || "#10B981",
      fontWeight: "700",
      fontSize: 14,
    },

    qtyValue: {
      color: ui?.buttonColor || "#10B981",
      fontWeight: "700",
      fontSize: 13,
      minWidth: 20,
      textAlign: "center",
    },

    cartContainer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
    },

    cartButton: {
      backgroundColor: ui?.buttonColor || "#10B981",
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 0,
      borderColor: "transparent",
    },

    cartText: {
      color: ui?.buttonTextColor || "#FFFFFF",
      fontWeight: "800",
      fontSize: 14,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },

    selectModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "flex-end",
    },

    modalBox: {
      width: "95%",
      backgroundColor: ui?.modalBgColor || "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      maxHeight: "80%",
    },
    selectModalBox: {
      width: "100%",
      backgroundColor: ui?.modalBgColor || "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      padding: 16,
      height: "70%",
      paddingBottom: 24,
    },
     modalBox2: {
      width: "100%",
      backgroundColor: ui?.modalBgColor || "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      maxHeight: "100%",
    },

    modalTitle: {
      color: ui?.modalTitleColor || ui?.headerTitleColor || "#111827",
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 16,
    },

    authOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    authModalCard: {
      width: "100%",
      backgroundColor: ui?.modalBgColor || "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      borderWidth: 0,
      borderColor: "transparent",
    },

    authModalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: ui?.modalTitleColor || "#111827",
      marginBottom: 10,
      textAlign: "center",
    },

    authModalMessage: {
      fontSize: 13,
      lineHeight: 18,
      color: ui?.cardTextColor || "#667781",
      textAlign: "center",
      marginBottom: 18,
    },

    authActionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },

    authCancelBtn: {
      flex: 1,
      backgroundColor: ui?.qtyBgColor || "#F0F0F0",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    authCancelText: {
      color: ui?.cardTextColor || "#111827",
      fontWeight: "700",
      fontSize: 14,
    },

    authLoginBtn: {
      flex: 1,
      backgroundColor: ui?.buttonColor || "#10B981",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    authLoginText: {
      color: ui?.buttonTextColor || "#FFFFFF",
      fontWeight: "800",
      fontSize: 14,
    }

  })