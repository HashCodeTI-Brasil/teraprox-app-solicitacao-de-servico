import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WebProviderComponent from './websocket/wsProvider';
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

const App = () => {
  return (
    <WebProviderComponent>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path={paths.solicitacoesDeServico} element={<SolicitacoesDeServico />} />
          <Route path={paths.solicitacaoDeServicoForm} element={<SolicitacaoDeServicoForm />} />
          <Route path="*" element={<Navigate to={paths.solicitacoesDeServico} replace />} />
        </Routes>
      </Suspense>
    </WebProviderComponent>
  );
};

export default App;
