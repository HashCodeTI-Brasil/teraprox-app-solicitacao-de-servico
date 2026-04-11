import 'bootstrap/dist/css/bootstrap.min.css';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { ValidateProvider } from './providers/ValidateProvider';
import { store, persistor } from './store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ToastProvider autoDismiss autoDismissTimeout={4000}>
        <StrictMode>
          <ValidateProvider>
            <App />
          </ValidateProvider>
        </StrictMode>
      </ToastProvider>
    </PersistGate>
  </Provider>
);
