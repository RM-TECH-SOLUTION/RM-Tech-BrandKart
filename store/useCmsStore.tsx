import { create } from "zustand";
import apiClient from "../api/apiClient";

const useCmsStore = create((set) => ({
  cmsData: null,
  loading: false,
  error: null,

  getCmsData: async () => {
    try {
      set({ loading: true, error: null });

      // 🔥 Uses apiClient (merchant_id auto attached)
      const data = await apiClient.get(apiClient.Urls.getCmsByMerchant);

      // console.log("✅ CMS DATA:", data);

      set({
        cmsData: data,
        loading: false,
      });

    } catch (error) {

      set({
        error: error.message,
        loading: false,
      });
    }
  },
}));

export default useCmsStore;
