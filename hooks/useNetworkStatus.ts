import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseNetworkStatusReturn {
  isNetworkLost: boolean;
  isChecking: boolean;
}

const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isNetworkLost, setIsNetworkLost] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const appState = useRef(AppState.currentState);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkNetworkConnection = async () => {
    try {
      setIsChecking(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 204) {
        setIsNetworkLost(false);
      } else {
        setIsNetworkLost(true);
      }
    } catch (error) {
      setIsNetworkLost(true);
    } finally {
      setIsChecking(false);
    }
  };

  const startPeriodicCheck = () => {
    // Check every 10 seconds
    checkIntervalRef.current = setInterval(() => {
      checkNetworkConnection();
    }, 10000);
  };

  const stopPeriodicCheck = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // Initial check
    checkNetworkConnection();

    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Start periodic checking
    startPeriodicCheck();

    return () => {
      subscription.remove();
      stopPeriodicCheck();
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    appState.current = state;

    if (state === 'active') {
      // App came to foreground - check network immediately
      checkNetworkConnection();
      startPeriodicCheck();
    } else {
      // App went to background
      stopPeriodicCheck();
    }
  };

  return {
    isNetworkLost,
    isChecking,
  };
};

export default useNetworkStatus;
