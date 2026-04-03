import React, { useEffect } from 'react';

/**
 * FederatedBridge — sinaliza que este remote está hospedado pelo Core.
 * O CoreServiceContext já vem do Core (CoreServiceProvider) — não é
 * necessário re-prover WebProvider aqui.
 */
export default function FederatedBridge({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__TERAPROX_HOSTED_BY_CORE__ = true;
    return () => {
      window.__TERAPROX_HOSTED_BY_CORE__ = false;
    };
  }, []);

  return <>{children}</>;
}
