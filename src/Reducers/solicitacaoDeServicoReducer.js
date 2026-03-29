import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    setId(state, action) {
      state.form.id = action.payload;
    },
    setDescricaoDoProblema(state, action) {
      state.form.descricaoDoProblema = action.payload;
    },
    setRecursos(state, action) {
      state.form.recursos = action.payload;
    },
    setDataAbertura(state, action) {
      state.form.dataDeAbertura = action.payload;
    },
    setStatus(state, action) {
      state.form.status = action.payload;
    },
    setRecurso(state, action) {
      state.form.recurso = action.payload;
    },
    setSolicitante(state, action) {
      const { userId, fullName } = action.payload;
      state.form.userId = userId;
      state.form.solicitante = fullName;
    },
    updateSingleSsRow(state, action) {
      const index = state.solicitacoes.findIndex((ss) => ss.id === action.payload.id);
      if (index !== -1) {
        state.solicitacoes[index] = action.payload;
      } else {
        if (action.payload.status !== 'APROVADO') {
          state.solicitacoes.unshift(action.payload);
        }
      }
    },
    populateToEdit(state, action) {
      state.form = action.payload;
    },
    clear(state) {
      state.form = initialState.form;
    },
    setSolicitacoes(state, action) {
      state.solicitacoes = action.payload;
    },
    setSetorDestino(state, action) {
      state.form.setorDestino = action.payload;
    },
    setSetor(state, action) {
      state.form.setor = action.payload;
    },
    setAnexo(state, action) {
      state.form.anexo = action.payload;
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
} = solicitacaoDeServicoSlice.actions;

export default solicitacaoDeServicoSlice.reducer;
