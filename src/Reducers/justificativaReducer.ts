import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JustificativaForm {
  userId: string;
  descricao: string;
  indexRegistro: string | number;
  registroDeCampoId: string | number | null;
}

interface JustificativaState {
  form: JustificativaForm;
  justificativas: any[];
}

const initialState: JustificativaState = {
	form: {
		userId: '',
		descricao: '',
		indexRegistro: '',
		registroDeCampoId: null,
	},
	justificativas: [],
};

const justificativaReducer = createSlice({
	name: 'justificativaReducer',
	initialState,
	reducers: {
		setDescricaoJustificativa(state, action: PayloadAction<string>) {
			state.form.descricao = action.payload;
		},
		setIndexRegistro(state, action: PayloadAction<string | number>) {
			state.form.indexRegistro = action.payload;
		},
		setRegistroDeCampoId(state, action: PayloadAction<string | number | null>) {
			state.form.registroDeCampoId = action.payload;
		},
		setUpdateJustificativa(state, action: PayloadAction<{ justificativa: any; index: number }>) {
			const { justificativa, index } = action.payload;
			state.justificativas[index] = justificativa;
		},
		setJustificativas(state, action: PayloadAction<any[]>) {
			const justificativas = action.payload || [];
			if (!Array.isArray(justificativas)) {
				state.justificativas = justificativas;
			} else {
				state.justificativas = [...state.justificativas, ...justificativas];
			}
		},
		populateToEdit(state, action: PayloadAction<JustificativaForm>) {
			state.form = action.payload;
		},
		populateJustificativas(state, action: PayloadAction<any[]>) {
			state.justificativas = action.payload;
		},
		clear(state) {
			state.form = initialState.form;
			state.justificativas = initialState.justificativas;
		},
	},
});

export const {
	setDescricaoJustificativa,
	populateToEdit : populateToEditJustificativa,
	setJustificativas,
	setIndexRegistro,
	clear : clearJustificativaForm,
	setRegistroDeCampoId,
	setUpdateJustificativa,
	populateJustificativas,
} = justificativaReducer.actions;
export default justificativaReducer.reducer;
