import React, { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FetchHttpAdapter, NullHttpController } from 'teraprox-core-sdk';
import type { ToastService } from 'teraprox-core-sdk';
import { StandaloneProvider, DevAutoLogin } from 'teraprox-core-sdk/federation';
import GlobalErrorBoundary from './providers/GlobalErrorBoundary';
import { logIn, setCompany } from './Reducers/globalConfigReducer';
import { paths } from './models/constantes';

// ─── Toast Adapter (lightweight DOM-based toasts) ────────────────────────────
class DomToastAdapter implements ToastService {
  private container: HTMLDivElement | null = null;

  private getContainer(): HTMLDivElement {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.createElement('div');
      Object.assign(this.container.style, {
        position: 'fixed', top: '16px', right: '16px', zIndex: '99999',
        display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px',
      });
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private show(message: string, bg: string, color: string) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      padding: '12px 18px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500',
      background: bg, color, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'fadeIn 0.25s ease', fontFamily: 'Arial, sans-serif',
    });
    el.textContent = message;
    this.getContainer().appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 3500);
    setTimeout(() => el.remove(), 4000);
  }

  success(msg: string) { this.show(msg, '#dcfce7', '#166534'); }
  warning(msg: string) { this.show(msg, '#fef3c7', '#92400e'); }
  error(msg: string)   { this.show(msg, '#fee2e2', '#991b1b'); }
  info(msg: string)    { this.show(msg, '#dbeafe', '#1e40af'); }
}

// ─── Fallbacks para dados estruturais (modo dev sem depender da API) ────────
class ArvoreEstruturalFallback extends NullHttpController {
  get(path?: string) {
    if (path && path.includes('branchByBranchLevel')) {
      return Promise.resolve([
        { id: 1, branchLevel: { level: 1, nome: 'Empresa', color: '#ff0000' }, nomeRecurso: 'Escolha a Empresa', branchNodes: [] }
      ]);
    }
    return super.get(path);
  }
}

class BranchLevelFallback extends NullHttpController {
  readAll() {
    return Promise.resolve([
      { id: 1, level: 1, nome: 'Empresa' },
      { id: 2, level: 2, nome: 'Unidade' },
      { id: 3, level: 3, nome: 'Área' },
      { id: 4, level: 4, nome: 'Máquina' },
    ]);
  }
}

// ─── Configuração de endpoint ────────────────────────────────────────────────
const API_ENDPOINT =
  process.env.REACT_APP_END_POINT_MANUTENCAO ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:4021';

const GATEWAY_HOST =
  process.env.REACT_APP_TERAPROX_GATEWAY_HOST || 'manutencao';

// Factory de controllers HTTP — espelhado do CoreServiceBuilder com fallbacks de dev
function makeController(context: string, baseEndPoint?: string) {
  if (process.env.NODE_ENV !== 'production') {
    if (context === '') return new ArvoreEstruturalFallback();
    if (context === 'branchLevel') return new BranchLevelFallback();
  }
  const ep = baseEndPoint ?? (context ? `${API_ENDPOINT}/${context}` : API_ENDPOINT);
  return new FetchHttpAdapter(ep, { 'x-teraprox-host': GATEWAY_HOST });
}

// Singleton do toast — evita recriação por render
const domToast = new DomToastAdapter();

// ─── Configuração do emulador RTDB (Docker na porta 9000) ───────────────────
const RTDB_EMULATOR = { host: 'localhost', port: 9000, namespace: 'teraprox-default-rtdb' };

// ─── Wrapper standalone: lê tenant do Redux e conecta ao RTDB ───────────────
// Resolução do tenant (ordem de prioridade, primeira que tiver valor vence):
//   1. Redux state.global.companyId  (real após login / DevAutoLogin)
//   2. REACT_APP_RTDB_TENANT no .env (fallback estático para dev — definido abaixo)
//   3. 'dev-local' interno do StandaloneProvider (último recurso em NODE_ENV=development)
function StandaloneWrapper({ children }: { children: React.ReactNode }) {
  // Pode ser null antes do DevAutoLogin popular o Redux — StandaloneProvider resolve o fallback.
  const tenant = useSelector((state: any) => state.global?.companyId) ?? undefined;

  return (
    <StandaloneProvider
      createController={makeController}
      toast={domToast}
      tenant={tenant}
      emulator={RTDB_EMULATOR}
    >
      {children}
    </StandaloneProvider>
  );
}

// ─── Lazy screens ────────────────────────────────────────────────────────────
const SolicitacoesDeServico    = lazy(() => import('./Screens/SolicitacoesDeServico'));
const SolicitacaoDeServicoForm = lazy(() => import('./Screens/SolicitacaoDeServicoForm'));
const AprovacaoStatus          = lazy(() => import('./Screens/AprovacaoStatus'));

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
  </div>
);

function AppCore() {
  return (
    <GlobalErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <SolicitacoesDeServico />
      </Suspense>
    </GlobalErrorBoundary>
  );
}

class App extends React.Component {
  render() {
    const hostedByCore =
      typeof window !== 'undefined' && !!(window as any).__TERAPROX_HOSTED_BY_CORE__;

    const router = createBrowserRouter([
      {
        path: paths.solicitacoesDeServico,
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <AppCore />
          </DevAutoLogin>
        ),
      },
      {
        path: paths.solicitacaoDeServicoForm,
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <Suspense fallback={<Fallback />}>
              <SolicitacaoDeServicoForm />
            </Suspense>
          </DevAutoLogin>
        ),
      },
      {
        path: paths.aprovaStatus,
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <Suspense fallback={<Fallback />}>
              <AprovacaoStatus />
            </Suspense>
          </DevAutoLogin>
        ),
      },
      {
        path: '*',
        element: (
          <DevAutoLogin actions={{ logIn, setCompany }}>
            <AppCore />
          </DevAutoLogin>
        ),
      },
    ]);

    // Em standalone: StandaloneWrapper provê CoreServiceContext + listener RTDB
    // Hospedado pelo Core: o shell injeta o CoreService via FederatedBridge
    if (!hostedByCore) {
      return (
        <StandaloneWrapper>
          <RouterProvider router={router} />
        </StandaloneWrapper>
      );
    }

    return <RouterProvider router={router} />;
  }
}

export default App;
