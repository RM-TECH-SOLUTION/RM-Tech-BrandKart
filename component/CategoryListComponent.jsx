import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

  const CARD_WIDTH =
    (width - 42 - (gridColumns - 1) * 20) / gridColumns;

  const dynamicStyles = styles(uiConfig, CARD_WIDTH);
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
      style={dynamicStyles.card}
      onPress={() => handleSelectCategoryLocal(item)}
    >

      {getImageUri(item) && (
        <Image
          source={{ uri: getImageUri(item) }}
          style={[dynamicStyles.image, { backgroundColor: "#fff" }]}
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
      style={dynamicStyles.card}
      onPress={() => setSelectedMainCatalogue(item)}
    >

      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={[dynamicStyles.image, { backgroundColor: "#fff" }]}
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

        {getImageUri(item) && (

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

        )}
        <View style={{ flex: 1, justifyContent: "space-between" }}>

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

            {item.stock && (
              <Text style={dynamicStyles.cardText}>
                Stock-{item.stock}
              </Text>
            )}

            <View style={{ flexDirection: "column", alignItems: "center", marginTop: 4 }}>
              <Text style={
                { color: uiConfig?.priceColor || "#000", fontSize: 16, fontWeight: "bold", marginTop: 4 }
              }>
                ₹{activeVariant?.price || item.price}
              </Text>
              {(activeVariant?.compare_price || item?.compare_price) && (
                <Text
                  style={{
                    color: uiConfig?.qtyBgColor || "#888",
                    textDecorationLine: "line-through",
                    marginLeft: 6
                  }}
                >
                  ₹{activeVariant?.compare_price || item?.compare_price}
                </Text>
              )}

            </View>
          </TouchableOpacity>

          <View style={{ marginTop: 10 }}>

            {isOutOfStock ? (

              <View style={dynamicStyles.outOfStock}>
                <Text style={dynamicStyles.outText}>
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
                  <Text style={dynamicStyles.qtyText}>-</Text>
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
                  <Text style={dynamicStyles.qtyText}>+</Text>
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

      <Text style={dynamicStyles.headerTitle}>
        {uiConfig?.headerTitle || "Catalog"}
      </Text>

      {/* ================= SELECTED CATEGORY ================= */}

      {!selectedCategory ? (

        <Text style={dynamicStyles.selectText}>
          Please select a catalog...
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
              marginBottom: 12
            }}
            renderItem={({ item }) => renderItemCard(item)}
            contentContainerStyle={{ paddingBottom: 120 }}
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
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalBox}>
            <Text style={dynamicStyles.modalTitle}>
              Select Catalog
            </Text>

            {/* If mainCatalogues is not present or empty, skip to catalog selection */}
            {(!mainCatalogues || mainCatalogues.length === 0) ? (
              <FlatList
                data={CATEGORIES}
                keyExtractor={(i) => i.id.toString()}
                numColumns={gridColumns}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => renderCategoryCard(item)}
              />
            ) : (
              <>
                {/* MAIN CATALOGUES */}
                {!selectedMainCatalogue && (
                  <FlatList
                    data={mainCatalogues}
                    keyExtractor={(i) => i.id.toString()}
                    numColumns={gridColumns}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => renderMainCatalogCard(item)}
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
                      columnWrapperStyle={{ justifyContent: "space-between" }}
                      renderItem={({ item }) => renderCategoryCard(item)}
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
          backgroundColor: "#000",
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

            <Text style={{ color: "#fff", fontSize: 16 }}>Close</Text>

          </TouchableOpacity>

        </View>

      </Modal>
    </View>

  );

};

export default CategoryListComponent;

/* ================= STYLES ================= */

const styles = (ui, CARD_WIDTH) =>
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: ui?.pageBgColor || "#0F0F0F",
      paddingHorizontal: 16
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: ui?.headerTitleColor || "#E50914",
      marginVertical: 20
    },

    selectText: {
      textAlign: "center",
      color: "#888",
      marginTop: 80
    },

    selectedBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: ui?.cardBgColor || "#1A1A1A",
      padding: 14,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)"
    },

    selectedLabel: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700"
    },

    changeText: {
      color: ui?.cardTextColor || "#E50914",
      fontWeight: "600"
    },

    card: {
      width: CARD_WIDTH,
      backgroundColor: ui?.cardBgColor || "#1A1A1A",
      borderRadius: 20,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)"
    },

    image: {
      width: "100%",
      height: 110,
      borderRadius: 14,
      marginBottom: 10,
      resizeMode: "contain"
    },

    cardText: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700"
    },

    cardText2: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700",
      textAlign: "center"
    },

    priceText: {
      color: "#aaa",
      marginTop: 4
    },

    addButton: {
      backgroundColor: ui?.buttonColor || "#E50914",
      paddingVertical: 8,
      borderRadius: 12,
      marginTop: 10,
      alignItems: "center"
    },

    addButtonText: {
      color: ui?.buttonTextColor || "#fff",
      fontWeight: "700"
    },

    qtyContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: ui?.buttonColor || "#E50914",
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 10
    },

    qtyButton: {
      backgroundColor: ui?.buttonTextColor || "#E50914",
      width: 26,
      height: 26,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center"
    },

    qtyText: {
      color: ui?.buttonColor || "#fff",
      fontWeight: "700"
    },

    qtyValue: {
      color: "#fff",
      fontWeight: "700"
    },

    cartContainer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20
    },

    cartButton: {
      backgroundColor: ui?.buttonColor || "#E50914",
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)"
    },

    cartText: {
      color: ui?.buttonTextColor || "#fff",
      fontWeight: "800"
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center"
    },

    modalBox: {
      width: "95%",
      backgroundColor: ui?.pageBgColor || "#0F0F0F",
      borderRadius: 24,
      padding: 16,
      maxHeight: "80%"
    },

    modalTitle: {
      color: ui?.headerTitleColor || "#fff",
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 20
    },

    authOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    authModalCard: {
      width: "100%",
      backgroundColor: ui?.modalBgColor || ui?.pageBgColor || "#121212",
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },

    authModalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: ui?.headerTitleColor || "#fff",
      marginBottom: 10,
      textAlign: "center",
    },

    authModalMessage: {
      fontSize: 14,
      lineHeight: 20,
      color: ui?.cardTextColor || "#d4d4d4",
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
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    authCancelText: {
      color: ui?.cardTextColor || "#fff",
      fontWeight: "700",
    },

    authLoginBtn: {
      flex: 1,
      backgroundColor: ui?.buttonColor || "#E50914",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    authLoginText: {
      color: ui?.buttonTextColor || "#fff",
      fontWeight: "800",
    }

  })