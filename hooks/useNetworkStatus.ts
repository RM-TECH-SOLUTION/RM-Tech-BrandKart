import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

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

      // First check: Use native NetInfo API
      const state = await NetInfo.fetch();
      
      if (!state.isConnected) {
        setIsNetworkLost(true);
        setIsChecking(false);
        return;
      }

      // Second check: Verify with a fetch to multiple endpoints (with fallback)
      const endpoints = [
        'https://www.google.com/generate_204',
        'https://api.github.com',
        'https://www.cloudflare.com/cdn-cgi/trace',
      ];

      let isReachable = false;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(endpoint, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          
          if (response.ok || response.status === 204 || response.status === 200) {
            isReachable = true;
            break;
          }
        } catch (err) {
          // Try next endpoint
          continue;
        }
      }

      if (isReachable) {
        setIsNetworkLost(false);
      } else {
        setIsNetworkLost(true);
      }
    } catch (error) {
      // Fallback: Trust NetInfo if fetch fails
      try {
        const state = await NetInfo.fetch();
        setIsNetworkLost(!state.isConnected);
      } catch (e) {
        setIsNetworkLost(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const startPeriodicCheck = () => {
    // Check every 20 seconds (reduced frequency to avoid rate limiting)
    checkIntervalRef.current = setInterval(() => {
      checkNetworkConnection();
    }, 20000);
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
