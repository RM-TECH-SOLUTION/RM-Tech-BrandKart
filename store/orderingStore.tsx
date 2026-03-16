import { create } from "zustand";
import apiClient from "../api/apiClient";

const orderingStore = create((set, get) => ({
  /* ======================================================
     STATE
  ====================================================== */

  loading: false,
  success: false,
  errorMessage: null,

  // Catalog
  catalogModels: [],
  catalogItems: [],
  selectedCatalogId: null,

  // Cart
  cartItems: [],
  merchantData:null,
  loyaltySettings: null,
  couponCodeResponse:null,
  orderHistoryResponse:null,
  mainCatalogues:null,

  /* ======================================================
     📦 GET CATALOG MODELS
  ====================================================== */

  getCatalogModels: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.get(
        apiClient.Urls.getCatalogueModels
      );

      // console.log("📦 getCatalogModels →", res);

      if (res?.success) {
        set({ catalogModels: res.data || [] });
      } else {
        set({
          catalogModels: [],
          errorMessage: res?.message || "Failed to load catalogs",
        });
      }
    } catch (err) {
      console.log("getCatalogModels error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* ======================================================
   🎁 GET LOYALTY SETTINGS
====================================================== */

getLoyaltySettings: async () => {

  set({ loading: true, errorMessage: null });

  try {

    const res = await apiClient.get(
      apiClient.Urls.getLoyaltySettings
    );

    // console.log("🎁 getLoyaltySettings →", res);

    if (res?.success) {
      set({ loyaltySettings: res.settings || null });
    } else {
      set({
        loyaltySettings: null,
        errorMessage: res?.message || "Failed to load loyalty settings",
      });
    }

  } catch (err) {

    console.log("getLoyaltySettings error", err);

    set({ errorMessage: err.message });

  } finally {
    set({ loading: false });
  }
},

apply_coupon: async (coupon_code, amount) => {

  set({ loading: true, errorMessage: null });

  try {

    const res = await apiClient.post(
      apiClient.Urls.apply_coupon,
      {
        coupon: coupon_code,
        amount: amount,
      }
    );

    if (res?.success) {

      set({
        couponCodeResponse: res,
        errorMessage: null
      });

      return res; // important

    } else {

      set({
        couponCodeResponse: null,
        errorMessage: res?.message || "Invalid coupon"
      });

      return null;
    }

  } catch (err) {

    console.log("apply_coupon error", err);

    set({
      errorMessage: err.message
    });

    return null;

  } finally {

    set({ loading: false });

  }
},
    // console.log("🎁 apply_coupon →", res );
    

  /* ======================================================
     🧾 GET ITEMS BY CATALOG
  ====================================================== */

  getCatalogItems: async (catalogueModelId) => {
    set({
      loading: true,
      errorMessage: null,
      selectedCatalogId: catalogueModelId,
    });

    try {
      const res = await apiClient.get(
        apiClient.Urls.getCatalogueItems,
        { catalogueModelId }
      );

      // console.log("🧾 getCatalogItems →", res);

      if (res?.success) {
        set({ catalogItems: res.data || [] });
      } else {
        set({
          catalogItems: [],
          errorMessage: res?.message || "No items found",
        });
      }
    } catch (err) {
      console.log("getCatalogItems error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* ======================================================
     🛒 GET CART
  ====================================================== */

  getCart: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.get(apiClient.Urls.getCart);

      // console.log("🛒 getCart →", res);

      if (res?.success) {
        set({ cartItems: res.cart || [] });
      } else {
        set({
          cartItems: [],
          errorMessage: res?.message || "Cart empty",
        });
      }
    } catch (err) {
      console.log("getCart error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

    getMerchant: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.get(apiClient.Urls.getMerchant);

      // console.log(res,"resresjjgj");
      

      if (res?.success) {
        set({ merchantData: res.data || [] });
      } else {
        set({
          merchantData: [],
          errorMessage: res?.message || "merchant empty",
        });
      }
    } catch (err) {
      console.log("merchantData error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

    getMainCatalogues: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.get(apiClient.Urls.getMainCatalogues);

      if (res?.success) {
        set({ mainCatalogues: res.data || [] });
      } else {
        set({
          merchantData: [],
          errorMessage: res?.message || "mainCatalogues empty",
        });
      }
    } catch (err) {
      console.log("mainCatalogues error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },
  /* ======================================================
     ➕ ADD TO CART
  ====================================================== */

addToCart: async ({
  item_id,
  item_name,
  description = "",
  price,
  compare_price = null,
  quantity = 1,
  variant_id = null,
  variant_name = null
}) => {

  set({ loading: true, errorMessage: null });

  try {

    const payload = {
      item_id,
      item_name,
      description,
      price,
      compare_price,
      quantity
    };

    // add variant if exists
    if (variant_id) {
      payload.variant_id = variant_id;
      payload.variant_name = variant_name;
    }

    const res = await apiClient.post(
      apiClient.Urls.getAddCart,
      payload
    );

    if (res?.success) {
      get().getCart();
    } else {
      set({ errorMessage: res?.message || "Add to cart failed" });
    }

  } catch (err) {
    console.log("addToCart error", err);
    set({ errorMessage: err.message });
  } finally {
    set({ loading: false });
  }
},
  /* ======================================================
     🔁 UPDATE QTY
  ====================================================== */

  updateQty: async (cart_id, type) => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.post(
        apiClient.Urls.updateCartQty,
        { cart_id, type }
      );

      // console.log("🔁 updateQty →", res);

      if (res?.success) {
        get().getCart();
      } else {
        set({ errorMessage: res?.message || "Update failed" });
      }
    } catch (err) {
      console.log("updateQty error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* ======================================================
     🗑 DELETE CART ITEM
  ====================================================== */

  deleteCartItem: async (cart_id) => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.post(
        apiClient.Urls.deleteCartItem,
        { cart_id }
      );

      // console.log("🗑 deleteCartItem →", res);

      if (res?.success) {
        get().getCart();
      } else {
        set({ errorMessage: res?.message || "Delete failed" });
      }
    } catch (err) {
      console.log("deleteCartItem error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    // set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.post(
        apiClient.Urls.clearCart
      );

      console.log(" clearCart →", res);

      if (res?.success) {
        get().getCart();
      } else {
        set({ errorMessage: res?.message || "Delete failed" });
      }
    } catch (err) {
      console.log("clearCart error", err);

      set({ errorMessage: err.message });
    } finally {
      set({ loading: false });
    }
  },
  orderHistory: async () => {
    set({ loading: true, errorMessage: null });

    try {
      const res = await apiClient.get(
        apiClient.Urls.order_history
      );

      console.log(" order_history →", res);

      if (res?.success) {
         set({ orderHistoryResponse: res.data || [] });
      } else {
        set({ errorMessage: res?.message || "Failed to load order history" });
        return [];
      }
    } catch (err) {
      console.log("order_history error", err);

      set({ errorMessage: err.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },  

}));

export default orderingStore;
