import { SolicitacaoDeServico } from 'teraprox-core-sdk';

export interface ISolicitacaoViewModel {
  // ── Fetched state ──────────────────────────────────────────────────────
  solicitacoes: SolicitacaoDeServico[];
  loading: boolean;

  // ── Date range ─────────────────────────────────────────────────────────
  startDate: string;
  endDate: string;
  setStartDate(d: string): void;
  setEndDate(d: string): void;
  setPeriod(period: string): void;

  // ── API actions ────────────────────────────────────────────────────────
  fetchSolicitacoes(): Promise<void>;
  /** Subscribe to real-time updates; returns unsubscribe callback. */
  subscribeRealtime(): () => void;

  // ── Navigation actions ─────────────────────────────────────────────────
  /** Validates recursos exist, sets Redux solicitante, navigates to form. */
  handleNovaClick(): Promise<void>;
  /** Populates Redux form state and navigates to edit form. */
  handleCardClick(ss: SolicitacaoDeServico): void;
  /** Populates Redux form state and navigates to approval screen. */
  handleAprovarClick(ss: SolicitacaoDeServico): void;

  // ── User context (from global Redux) ───────────────────────────────────
  userId: string;
  fullName: string;
  setor: string;
}
