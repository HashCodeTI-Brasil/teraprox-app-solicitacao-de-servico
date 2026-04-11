import React, { Suspense, lazy, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { StandaloneProvider, DevAutoLogin } from 'teraprox-core-sdk/federation';
import GlobalErrorBoundary from './providers/GlobalErrorBoundary';
import WebProviderComponent from './websocket/wsProvider';
import { useWebProvider } from './hooks/defaults/useWebProvider';
import { logIn, setCompany } from './Reducers/globalConfigReducer';
import { paths } from './models/constantes';

const SolicitacoesDeServico = lazy(() => import('./Screens/SolicitacoesDeServico'));
const SolicitacaoDeServicoForm = lazy(() => import('./Screens/SolicitacaoDeServicoForm'));

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
  </div>
);

function AppCore() {
  const { addToast } = useToasts();
  const { controller } = useWebProvider();
  const companyId = useSelector((state) => state.global.companyId);
  const firebaseConfig = useMemo(() => {
    try { return JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}'); }
    catch { return {}; }
  }, []);
  const hostedByCore = typeof window !== 'undefined' && !!window.__TERAPROX_HOSTED_BY_CORE__;

  const content = (
    <GlobalErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <SolicitacoesDeServico />
      </Suspense>
    </GlobalErrorBoundary>
  );

  if (hostedByCore) return content;

  return (
    <StandaloneProvider createController={controller} addToast={addToast} firebaseConfig={firebaseConfig} tenant={companyId}>
      {content}
    </StandaloneProvider>
  );
}

class App extends React.Component {
  render() {
    const router = createBrowserRouter([
      {
        path: paths.solicitacoesDeServico,
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <WebProviderComponent>
              <AppCore />
            </WebProviderComponent>
          </DevAutoLogin>
        ),
      },
      {
        path: paths.solicitacaoDeServicoForm,
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <WebProviderComponent>
              <Suspense fallback={<Fallback />}>
                <SolicitacaoDeServicoForm />
              </Suspense>
            </WebProviderComponent>
          </DevAutoLogin>
        ),
      },
      {
        path: '*',
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <WebProviderComponent>
              <AppCore />
            </WebProviderComponent>
          </DevAutoLogin>
        ),
      },
    ]);

    return <RouterProvider router={router} />;
  }
}

export default App;
