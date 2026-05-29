import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MerchantState {
  merchantId: number | null;
  merchantName: string | null;
  merchantStatus: "unknown" | "active" | "inactive";
  inactiveMerchantName: string | null;
  setMerchant: (id: number, name: string) => void;
  setMerchantVerification: (
    status: "unknown" | "active" | "inactive",
    inactiveName?: string | null
  ) => void;
  clearMerchant: () => void;
}

const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      merchantId: null,
      merchantName: null,
      merchantStatus: "unknown",
      inactiveMerchantName: null,

      setMerchant: (id: number, name: string) =>
        set({
          merchantId: id,
          merchantName: name,
          merchantStatus: "unknown",
          inactiveMerchantName: null,
        }),

      setMerchantVerification: (status, inactiveName = null) =>
        set({
          merchantStatus: status,
          inactiveMerchantName: inactiveName,
        }),

      clearMerchant: () =>
        set({
          merchantId: null,
          merchantName: null,
          merchantStatus: "unknown",
          inactiveMerchantName: null,
        }),
    }),
    {
      name: "merchant-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useMerchantStore;
