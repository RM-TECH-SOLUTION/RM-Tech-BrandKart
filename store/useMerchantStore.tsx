import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MerchantState {
  merchantId: number | null;
  merchantName: string | null;
  setMerchant: (id: number, name: string) => void;
  clearMerchant: () => void;
}

const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      merchantId: null,
      merchantName: null,

      setMerchant: (id: number, name: string) =>
        set({ merchantId: id, merchantName: name }),

      clearMerchant: () =>
        set({ merchantId: null, merchantName: null }),
    }),
    {
      name: "merchant-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useMerchantStore;
