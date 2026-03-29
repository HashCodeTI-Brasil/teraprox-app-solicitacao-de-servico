import React, { useEffect } from 'react';
import { WebProvider } from '../websocket/wsProvider';

/**
 * FederatedBridge — injects the Core's WebProvider context into this remote.
 * The Core passes its webProviderValue; this component bridges it using the
 * same createContext reference exported from this module's wsProvider.
 */
export default function FederatedBridge({ webProviderValue, children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__TERAPROX_HOSTED_BY_CORE__ = true;
    return () => {
      window.__TERAPROX_HOSTED_BY_CORE__ = false;
    };
  }, []);

  return (
    <WebProvider.Provider value={webProviderValue}>
      {children}
    </WebProvider.Provider>
  );
}
