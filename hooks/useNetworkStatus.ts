import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface UseNetworkStatusReturn {
  isNetworkLost: boolean;
  isChecking: boolean;
}

const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isNetworkLost, setIsNetworkLost] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkNetworkConnection = async () => {
    try {
      setIsChecking(true);
      const state = await NetInfo.fetch();
      
      // Only mark as network lost if explicitly confirmed by device
      setIsNetworkLost(state.isConnected === false);
    } catch (error) {
      // On error, assume we're connected (safer than false positive)
      setIsNetworkLost(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Only check when app returns to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        // Only check once when returning to foreground
        checkNetworkConnection();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    isNetworkLost,
    isChecking,
  };
};

export default useNetworkStatus;
