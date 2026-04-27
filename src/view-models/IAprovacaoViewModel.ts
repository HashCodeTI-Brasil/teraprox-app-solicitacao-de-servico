import type { Sector } from 'teraprox-ui-kit';
import type { AnexoPersistido, AnexoLocal } from 'teraprox-core-sdk';

export interface AprovacaoFormState {
  status: string;
  showDateField: boolean;
  showSectorChange: boolean | string;
  showReprovationReason: boolean;
}

export interface IAprovacaoViewModel {
  // ── Redux state ─────────────────────────────────────────────────────────
  form: any;
  tarefas: any[];
  justificativa: any;

  // ── Computed ────────────────────────────────────────────────────────────
  isApproved: boolean;
  isRejected: boolean;
  hasStatus: boolean;
  validationErrors: string[];

  // ── Form UI state ───────────────────────────────────────────────────────
  formState: AprovacaoFormState;
  setores: Sector[];
  isSubmitting: boolean;
  /** descricaoProblemaLocal foi movido para estado local do componente para evitar re-renders. */
  initialDescricao: string;
  /** Anexos já persistidos (carregados da API ou recém-enviados). */
  anexosPersistidos: AnexoPersistido[];
  /** Anexos locais na fila de upload. */
  anexosLocais: AnexoLocal[];
  carregandoAnexos: boolean;
  onAddAnexos(files: File[]): void;
  onRemoveAnexoLocal(localId: string): void;
  onRemoveAnexoPersistido(id: string | number): Promise<void>;
  getAnexoUrl(id: string | number, key?: string): Promise<string>;

  // ── Redux field dispatchers ─────────────────────────────────────────────
  dispatchSetDataPlanejada(iso: string | undefined): void;
  dispatchSetTipoOs(tipo: any): void;
  dispatchSetDescricaoJustificativa(v: string): void;
  dispatchAddTarefa(t: any): void;
  dispatchUpdateTarefa(t: any): void;
  dispatchAddTarefas(ts: any[]): void;
  dispatchSetMantenedor(m: any): void;
  dispatchClearMantenedor(): void;

  // ── UI state handlers ───────────────────────────────────────────────────
  handleStatusChange(status: string): void;
  handleSectorChange(enabled: boolean): void;
  handleSectorSelect(setor: Sector): void;
  handleDateFieldToggle(enabled: boolean): void;

  // ── Actions ─────────────────────────────────────────────────────────────
  /** descricaoProblema vem do estado local do componente para evitar re-renders por keystroke */
  handleSubmit(descricaoProblema: string): Promise<void>;
  handleCancel(): void;
}
