import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "@morfiapp/delivery_manual_v1";

export type ManualDeliveryLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

type DeliveryLocationContextValue = {
  manualLocation: ManualDeliveryLocation | null;
  setManualLocation: (value: ManualDeliveryLocation) => Promise<void>;
  clearManualLocation: () => Promise<void>;
};

const DeliveryLocationContext = createContext<
  DeliveryLocationContextValue | undefined
>(undefined);

export function DeliveryLocationProvider({ children }: { children: ReactNode }) {
  const [manualLocation, setManualState] =
    useState<ManualDeliveryLocation | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ManualDeliveryLocation;
          if (
            typeof parsed.latitude === "number" &&
            typeof parsed.longitude === "number" &&
            typeof parsed.label === "string"
          ) {
            setManualState(parsed);
          }
        }
      } catch {
        /* ignore corrupt storage */
      }
    })();
  }, []);

  const setManualLocation = useCallback(async (value: ManualDeliveryLocation) => {
    setManualState(value);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, []);

  const clearManualLocation = useCallback(async () => {
    setManualState(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      manualLocation,
      setManualLocation,
      clearManualLocation,
    }),
    [manualLocation, setManualLocation, clearManualLocation],
  );

  return (
    <DeliveryLocationContext.Provider value={value}>
      {children}
    </DeliveryLocationContext.Provider>
  );
}

export function useDeliveryLocation() {
  const ctx = useContext(DeliveryLocationContext);
  if (!ctx) {
    throw new Error(
      "useDeliveryLocation debe usarse dentro de DeliveryLocationProvider",
    );
  }
  return ctx;
}
