import { View } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import CategoryListComponent from "../component/CategoryListComponent";
import orderingStore from "../store/orderingStore";
import useCmsStore from "../store/useCmsStore";

const CategoryContainer = () => {
  const {
    catalogModels,
    catalogItems,
    cartItems,
    loading,
    getCatalogModels,
    getCatalogItems,
    addToCart,
    updateQty,
    deleteCartItem,
    getCart,
    mainCatalogues,
    getMainCatalogues
  } = orderingStore();

  const { cmsData } = useCmsStore();

  const [categoryUiConfig, setCategoryUiConfig] = useState({});
  const [cartMap, setCartMap] = useState({});

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    getMainCatalogues()
    getCatalogModels();
    getCart();
  }, []);


  /* ================= CMS FORMAT ================= */

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

  /* ================= MAP CART ================= */

  useEffect(() => {
    const map = {};
    cartItems.forEach((item) => {
      map[item.item_id] = {
        quantity: Number(item.quantity),
        cart_id: item.cart_id,
      };
    });
    setCartMap(map);
  }, [cartItems]);

  /* ================= CART TOTAL ================= */

  const { totalItems, totalPrice } = useMemo(() => {
    let count = 0;
    let price = 0;

    cartItems.forEach((item) => {
      count += Number(item.quantity || 0);
      price += Number(item.total || 0);
    });

    return {
      totalItems: count,
      totalPrice: price.toFixed(2),
    };
  }, [cartItems]);

  /* ================= HANDLERS ================= */

  const handleSelectCategory = (catalogId) => {
    getCatalogItems(catalogId);
  };

const handleAdd = async (item) => {

  await addToCart({
    item_id: item.id,
    item_name: item.name,
    description: item.description,
    price: item.variant?.price || item.price,
    compare_price: item.variant?.compare_price || item.compare_price,
    variant_id: item.variant?.id,
    variant_name: item.variant?.variant_name,
    quantity: 1,
  });

  getCart();
};

  const handleIncrease = async (item) => {
    if (!cartMap[item.id]) return;
    await updateQty(cartMap[item.id].cart_id, "inc");
    getCart();
  };

  const handleDecrease = async (item) => {
    if (!cartMap[item.id]) return;

    if (cartMap[item.id].quantity === 1) {
      await deleteCartItem(cartMap[item.id].cart_id);
    } else {
      await updateQty(cartMap[item.id].cart_id, "dec");
    }

    getCart();
  };

  return (
    <View style={{ flex: 1 }}>
      <CategoryListComponent
        CATEGORIES={catalogModels}
        ITEMS={catalogItems}
        cartMap={cartMap}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onSelectCategory={handleSelectCategory}
        loadingItems={loading}
        onAdd={handleAdd}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        uiConfig={categoryUiConfig}
        mainCatalogues={mainCatalogues}
      />
    </View>
  );
};

export default CategoryContainer;