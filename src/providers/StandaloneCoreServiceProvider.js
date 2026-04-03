/**
 * StandaloneCoreServiceProvider — provê CoreServiceContext em modo
 * standalone (npm start). No modo federado, o Core já provê via
 * CoreServiceProvider — este componente NÃO é montado.
 */
import React, { useMemo } from 'react';
import { CoreServiceContext } from 'teraprox-core-sdk';
import { useToasts } from 'react-toast-notifications';
import { useWebProvider } from '../hooks/useWebProvider';

export default function StandaloneCoreServiceProvider({ children }) {
  const wp = useWebProvider();
  const toast = useToasts();

  const value = useMemo(() => ({
    createController: (context, baseEndPoint) => wp.controller(context, baseEndPoint),

    toast: {
      success: (msg, opts) => toast.addToast(msg, { appearance: 'success', autoDismiss: true, ...opts }),
      warning: (msg, opts) => toast.addToast(msg, { appearance: 'warning', autoDismiss: true, ...opts }),
      error:   (msg, opts) => toast.addToast(msg, { appearance: 'error', autoDismiss: true, ...opts }),
      info:    (msg, opts) => toast.addToast(msg, { appearance: 'info', autoDismiss: true, ...opts }),
    },

    subscribe: wp.subscribe,
    unsubscribe: wp.unsubscribe,
    subscribeEvent: () => {},
    unsubscribeEvent: () => {},
    handleLogout: () => {},
    hostedByCore: false,
  }), [wp, toast]);

  return (
    <CoreServiceContext.Provider value={value}>
      {children}
    </CoreServiceContext.Provider>
  );
}
