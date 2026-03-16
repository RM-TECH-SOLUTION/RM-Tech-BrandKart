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
  mainCatalogues = []
}) => {

  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMainCatalogue, setSelectedMainCatalogue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 
  const [pdpVisible, setPdpVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showFullSpec, setShowFullSpec] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  // 

  const gridColumns = uiConfig?.gridColumns || 2;

  const CARD_WIDTH =
    (width - 42 - (gridColumns - 1) * 12) / gridColumns;

  const dynamicStyles = styles(uiConfig, CARD_WIDTH);
  const pdpQty = cartMap[selectedProduct?.id]?.quantity || 0;

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

  const getQty = (id) => cartMap[id]?.quantity || 0;

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

  const renderItemCard = (item) => {

    const qty = getQty(item.id);

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
              setSelectedVariant(item.variants[0]);
              setPdpVisible(true);
            }}
          >

            <Image
              source={{ uri: getImageUri(item) }}
              style={dynamicStyles.image}
            />

          </TouchableOpacity>

        )}

        <TouchableOpacity
          onPress={() => {
            setSelectedProduct(item);
            setSelectedVariant(item.variants[0]);
            setPdpVisible(true);
          }}
        >
          <Text numberOfLines={2} style={dynamicStyles.cardText}>
            {item.name}
          </Text>

          <Text style={dynamicStyles.priceText}>
            ₹{item.price}
          </Text>
        </TouchableOpacity>

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

              if (qty == 0) {

                setSelectedProduct(item);
                setSelectedVariant(item.variants[0]);
                setPdpVisible(true);

              } else {

                onAdd && onAdd(item);

              }

            }}
          >

            <Text style={dynamicStyles.addButtonText}>
              ADD
            </Text>

          </TouchableOpacity>

        ) : (

          <View style={dynamicStyles.qtyContainer}>

            <TouchableOpacity
              style={dynamicStyles.qtyButton}
              onPress={() => onDecrease(item)}
            >
              <Text style={dynamicStyles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={dynamicStyles.qtyValue}>
              {qty}
            </Text>

            <TouchableOpacity
              style={dynamicStyles.qtyButton}
              onPress={() => onIncrease(item)}
            >
              <Text style={dynamicStyles.qtyText}>+</Text>
            </TouchableOpacity>

          </View>

        )}

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
                  style={{ marginBottom: 10 }}
                >

                  <Text style={{ color: "#fff" }}>
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

          </View>

        </View>

      </Modal>
      <Modal visible={pdpVisible} transparent animationType="slide" >


        <View style={dynamicStyles.modalOverlay}>


          <View style={[dynamicStyles.modalBox2, {
            borderRadius: 24,
            padding: 16, height: "100%"
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
                  backgroundColor: "#1A1A1A",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
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
                        color: "#fff",
                        marginTop: 10
                      }}>
                        {selectedProduct.name}
                      </Text>

                      {/* BRAND */}
                      {selectedProduct.brand && (
                        <Text style={{ color: "#aaa", marginTop: 4 }}>
                          {selectedProduct.brand}
                        </Text>
                      )}

                      {/* PRICE */}
                      <View style={{ flexDirection: "row", marginTop: 6 }}>

                        <Text style={{
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: "700"
                        }}>
                          ₹{selectedVariant?.price || selectedProduct.price}
                        </Text>


                        {(selectedVariant?.compare_price || selectedProduct.compare_price) && (

                          <Text style={{
                            marginLeft: 10,
                            color: "#888",
                            textDecorationLine: "line-through"
                          }}>
                            ₹{selectedVariant?.compare_price || selectedProduct.compare_price}

                          </Text>

                        )}

                      </View>
                      <Text style={{ color: "#fff" }}>Stock-{selectedVariant?.stock}</Text>

                      {/* VARIANTS */}
                      {console.log(selectedProduct.variants, "selectedProduct.variants")}

                      {selectedProduct.variants?.length > 0 && (

                        <View style={{ marginTop: 16 }}>

                          <Text style={{
                            color: "#fff",
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
                              console.log(item, "itemitemhghjgjh");


                              return (
                                <>
                                  <TouchableOpacity
                                    disabled={!isStock}
                                    style={{
                                      paddingVertical: 8,
                                      paddingHorizontal: 14,
                                      borderRadius: 12,
                                      marginRight: 10,
                                      borderWidth: 1,
                                      borderColor: active ? "#E50914" : "#444",
                                      backgroundColor: !isStock
                                        ? "#333"
                                        : active
                                          ? "#E50914"
                                          : "#1A1A1A",
                                      opacity: isStock ? 1 : 0.5
                                    }}
                                    onPress={() => isStock && setSelectedVariant(item)}
                                  >
                                    <Text style={{ color: "#fff" }}>
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
                            color: "#fff",
                            fontWeight: "700",
                            marginBottom: 6
                          }}>
                            Specifications
                          </Text>

                          <Text style={{
                            color: "#aaa",
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
                                color: "#E50914",
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
                backgroundColor: "#111"
              }}
            >
              {console.log(selectedVariant?.stock, "selectedVariantjhuhutyfgkj")}

              <TouchableOpacity
                style={{
                  backgroundColor: "#E50914",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  marginBottom: 20
                }}
                onPress={() => {

                  if (selectedVariant?.stock === 0) return;

                  if (pdpQty === 0) {

                    onAdd && onAdd({
                      ...selectedProduct,
                      variant: selectedVariant
                    });

                  } else {

                    onIncrease && onIncrease({
                      ...selectedProduct,
                      variant: selectedVariant
                    });

                  }

                  setPdpVisible(false);
                  setShowFullSpec(false);

                }}
              >

                <Text style={{
                  color: "#fff",
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
      color: ui?.primaryColor || "#E50914",
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
      marginBottom: 20
    },

    selectedLabel: {
      color: "#fff",
      fontWeight: "700"
    },

    changeText: {
      color: ui?.primaryColor || "#E50914",
      fontWeight: "600"
    },

    card: {
      width: CARD_WIDTH,
      backgroundColor: ui?.cardBgColor || "#1A1A1A",
      borderRadius: 20,
      padding: 14
    },

    image: {
      width: "100%",
      height: 110,
      borderRadius: 14,
      marginBottom: 10
    },

    cardText: {
      color: "#fff",
      fontWeight: "700"
    },

    cardText2: {
      color: "#fff",
      fontWeight: "700",
      textAlign: "center"
    },

    priceText: {
      color: "#aaa",
      marginTop: 4
    },

    addButton: {
      backgroundColor: "#E50914",
      paddingVertical: 8,
      borderRadius: 12,
      marginTop: 10,
      alignItems: "center"
    },

    addButtonText: {
      color: "#fff",
      fontWeight: "700"
    },

    qtyContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#E50914",
      borderRadius: 12,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 10
    },

    qtyButton: {
      backgroundColor: "#fff",
      width: 26,
      height: 26,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center"
    },

    qtyText: {
      color: "#E50914",
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
      backgroundColor: "#111",
      paddingVertical: 16,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E50914"
    },

    cartText: {
      color: "#E50914",
      fontWeight: "800"
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: ui?.pageBgColor || "#0F0F0F",
      justifyContent: "center",
      alignItems: "center"
    },

    modalBox: {
      width: "95%",
      backgroundColor: "#1A1A1A",
      borderRadius: 24,
      padding: 16,
      maxHeight: "80%"
    },

    modalTitle: {
      color: "#E50914",
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 20
    }

  });