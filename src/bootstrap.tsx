import 'bootstrap/dist/css/bootstrap.min.css';
import 'teraprox-ui-kit/index.css';
import '@hashcodeti/ui-kit-core/dist/index.css';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { ValidateProvider } from './providers/ValidateProvider';
import { store, persistor } from './store';
import { initWebVitals, NullObservabilityAdapter } from 'teraprox-core-sdk';

// ── Web Vitals (LCP + CLS) ──────────────────────────────────────────────────
// O NullObservabilityAdapter grava no console em standalone mode.
// Quando hospedado pelo Core, o host injetará a implementação real de RUM
// (Datadog/Sentry/Grafana) via CoreServiceBuilder.withObservability().
initWebVitals(new NullObservabilityAdapter());

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        <StrictMode>
          <ValidateProvider>
            <App />
          </ValidateProvider>
        </StrictMode>
    </PersistGate>
  </Provider>
);
