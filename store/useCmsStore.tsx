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
      const response = await apiClient.get(apiClient.Urls.getCmsByMerchant);

      const normalizedCms = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      // console.log("✅ CMS DATA:", data);

      set({
        cmsData: normalizedCms,
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
