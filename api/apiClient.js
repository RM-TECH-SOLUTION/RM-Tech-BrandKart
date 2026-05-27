import expo from "../app.json";
import useSessionStore from "../store/useSessionStore";
import useMerchantStore from "../store/useMerchantStore";

/* ================== CONFIG ================== */

const rmtech = expo?.expo?.rmtech || {};

const BASE_URL = rmtech?.baseUrl?.endsWith("/")
  ? rmtech.baseUrl
  : rmtech.baseUrl + "/";

/* ================== API URLS ================= */

const URLS = {
  register: BASE_URL + "register.php",
  login: BASE_URL + "login.php",
  updateOrAddUser: BASE_URL + "registration-update.php",
  loginVerification: BASE_URL + "loginVerification.php",

  getCatalog: BASE_URL + "catalog.php",
  getItem: BASE_URL + "item.php",

  getCmsByMerchant: BASE_URL + "getCmsByMerchant.php",

  // CART
  getAddCart: BASE_URL + "add_to_cart.php",
  getCart: BASE_URL + "get_cart.php",
  updateCartQty: BASE_URL + "update_cart_qty.php",
  deleteCartItem: BASE_URL + "delete_cart_item.php",
  getCatalogueModels: BASE_URL + "getCatalogueModels.php",
  getCatalogueItems: BASE_URL + "getCatalogueItems.php",
  clearCart: BASE_URL + "clear_cart.php",


  razorpay: BASE_URL + "razorpay.php",
  getMerchant: BASE_URL + "getMerchant.php",
  saveUserAddress:BASE_URL + "save_user_address.php",
  getProfile:BASE_URL + "get_profile.php",
  getLoyaltySettings: BASE_URL + "get_loyalty_settings.php",
  apply_coupon: BASE_URL + "apply_coupon.php",
  order_history: BASE_URL + "order_history.php",
  getMainCatalogues: BASE_URL + "getMainCatalogues"
};

/* ================= API CLIENT ================= */

const apiClient = {
  Urls: URLS,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  async make(url, method = "GET", params = {}) {

    // 🔥 Get user from Zustand store
    const { user } = useSessionStore.getState();

    const userId = user?.id || null;

    // ✅ Always attach merchant_id & user_id
    const finalParams = {
      merchant_id: useMerchantStore.getState().merchantId ?? Number(rmtech?.merchantId || 0),
      user_id: userId,
      ...params,
    };

    const hasParams = Object.keys(finalParams).length > 0;

    const queryString =
      method === "GET" && hasParams
        ? "?" + new URLSearchParams(finalParams).toString()
        : "";

    const reqUrl = url + queryString;

    try {

      const response = await fetch(reqUrl, {
        method,
        headers: this.headers,
        ...(method !== "GET"
          ? { body: JSON.stringify(finalParams) }
          : {}),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {

        throw new Error("Invalid JSON response");
      }

      return data;

    } catch (error) {

      throw error;
    }
  },

  get(url, params = {}) {
    return this.make(url, "GET", params);
  },

  post(url, params = {}) {
    return this.make(url, "POST", params);
  },
};

export default apiClient;