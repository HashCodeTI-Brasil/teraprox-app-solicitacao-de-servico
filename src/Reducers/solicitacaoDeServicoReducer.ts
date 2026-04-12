import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolicitacaoDeServico, StatusSolicitacao } from 'teraprox-core-sdk';

interface Recurso { id: string | number; nome: string }
interface Mantenedor { id: string | number; nome: string }
interface OsTipo { id: string | number; descricao: string }

export interface SolicitacaoFormState {
  id?: string | number;
  descricaoDoProblema: string;
  dataDeAbertura: string;
  recurso: string | Recurso;
  status: StatusSolicitacao;
  statusId: string;
  userId: string;
  solicitante?: string;
  recursos: Recurso[];
  setor: string;
  setorDestino: string;
  anexo: string | File;  anexos?: any[];  dataPlanejada?: string;
  osMantenedor?: Mantenedor;
  mantenedores?: Mantenedor[];
  osTipos?: OsTipo[];
}

export interface SolicitacaoDeServicoState {
  form: SolicitacaoFormState;
  solicitacoes: SolicitacaoDeServico[];
}

const initialState: SolicitacaoDeServicoState = {
  form: {
    descricaoDoProblema: '',
    dataDeAbertura: '',
    recurso: '',
    status: 'PENDENTE',
    statusId: '',
    userId: '',
    recursos: [],
    setor: '',
    setorDestino: '',
    anexo: '',
  },
  solicitacoes: [],
};

const solicitacaoDeServicoSlice = createSlice({
  name: 'solicitacaoDeServicoReducer',
  initialState,
  reducers: {
    setId(state, action: PayloadAction<string | number>) {
      state.form.id = action.payload;
    },
    setDescricaoDoProblema(state, action: PayloadAction<string>) {
      state.form.descricaoDoProblema = action.payload;
    },
    setRecursos(state, action: PayloadAction<Recurso[]>) {
      state.form.recursos = action.payload;
    },
    setDataAbertura(state, action: PayloadAction<string>) {
      state.form.dataDeAbertura = action.payload;
    },
    setStatus(state, action: PayloadAction<StatusSolicitacao>) {
      state.form.status = action.payload;
    },
    setRecurso(state, action: PayloadAction<string | Recurso>) {
      state.form.recurso = action.payload;
    },
    setSolicitante(state, action: PayloadAction<{ userId: string; fullName: string }>) {
      const { userId, fullName } = action.payload;
      state.form.userId = userId;
      state.form.solicitante = fullName;
    },
    updateSingleSsRow(state, action: PayloadAction<SolicitacaoDeServico>) {
      const index = state.solicitacoes.findIndex((ss) => ss.id === action.payload.id);
      if (index !== -1) {
        state.solicitacoes[index] = action.payload;
      } else {
        if (action.payload.status !== 'APROVADO') {
          state.solicitacoes.unshift(action.payload);
        }
      }
    },
    populateToEdit(state, action: PayloadAction<SolicitacaoFormState>) {
      state.form = action.payload;
    },
    clear(state) {
      state.form = initialState.form;
    },
    setSolicitacoes(state, action: PayloadAction<SolicitacaoDeServico[]>) {
      state.solicitacoes = action.payload;
    },
    setSetorDestino(state, action: PayloadAction<string>) {
      state.form.setorDestino = action.payload;
    },
    setSetor(state, action: PayloadAction<string>) {
      state.form.setor = action.payload;
    },
    setAnexo(state, action: PayloadAction<string | File>) {
      state.form.anexo = action.payload;
    },
    setDataDePlanejamento(state, action: PayloadAction<string | undefined>) {
      state.form.dataPlanejada = action.payload;
    },
    setOsMantenedor(state, action: PayloadAction<Mantenedor | null>) {
      state.form.osMantenedor = action.payload ?? undefined;
      state.form.mantenedores = action.payload ? [action.payload] : [];
    },
    setOsTipos(state, action: PayloadAction<OsTipo[]>) {
      state.form.osTipos = action.payload;
    },
  },
});

export const {
  setId,
  setDescricaoDoProblema,
  setDataAbertura,
  setStatus,
  setRecurso,
  setRecursos,
  setSolicitante,
  updateSingleSsRow,
  populateToEdit,
  clear: clearSolicitacaoDeServicoForm,
  setSolicitacoes,
  setSetorDestino: setSetorDestinoSolicitacao,
  setSetor: setSetorSolicitacao,
  setAnexo,
  setDataDePlanejamento,
  setOsMantenedor: setSolicitacaoMantenedor,
  setOsTipos: setTipoOsSolicitacao,
} = solicitacaoDeServicoSlice.actions;

export default solicitacaoDeServicoSlice.reducer;
