import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { v4 as uuid } from "uuid"
import ObjectUtils from "../Services/objectUtils"

interface TarefaForm {
  acaoId: string | number | null;
  acao: string | any;
  status: string;
  descricao: string;
  sequencia: number;
  inspecoes: any[];
  unidadesMateriais?: any[];
  tarefaJustificativas?: any[];
  __id?: string;
}

interface TarefaState {
  form: TarefaForm;
  tarefas: any[];
}

const localIdSetter = (tarefa: any): any => {
	let tarefaToSet

	if(Array.isArray(tarefa)){	

		return tarefaToSet = tarefa.map(t => {
			if(!t.__id) return {...t, __id: uuid()}
			return t
		}
		) 
	}

	if(!tarefa.__id) return tarefaToSet = {...tarefa, __id: uuid()}

	return tarefa



}

const indexByLocalId = (state: TarefaState, __id: string): number | false => {
	const reachedIndex =  state.tarefas.findIndex(t => t.__id === __id)
	if(reachedIndex >= 0) return reachedIndex
	else {
		console.error(`id local ${__id} de tarefa não encontrado`)
		return false
	}
	
}
const initialState: TarefaState = {
	form: {
		acaoId: null,
		acao: "",
		status: "PENDENTE",
		descricao: "",
		sequencia: 1,
		inspecoes: [],
	},
	tarefas: [],
}

const tarefaReducer = createSlice({
	name: "tarefaReducer",
	initialState,
	reducers: {

		setAcao(state, action: PayloadAction<any>) {
			state.form.acao = action.payload
			state.form.acaoId = action.payload.id
			if(state.form.descricao === "") state.form.descricao = action.payload.descricao
		},
		setUnidadesDeMaterial(state, action: PayloadAction<any[]>) {
			state.form.unidadesMateriais = action.payload
		},
		setAddJustificativaTarefa(state, action: PayloadAction<any>) {
			if (!state.form.tarefaJustificativas)
				state.form.tarefaJustificativas = []
			state.form.tarefaJustificativas = [
				...state.form.tarefaJustificativas,
				action.payload,
			]
		},
		setJustificativasTarefa(state, action: PayloadAction<any[]>) {
			state.form.tarefaJustificativas = action.payload
		},
		setUpdateJustificativaTarefa(state, action: PayloadAction<any & { index: number }>) {
			const { index } = action.payload
			state.form.tarefaJustificativas![index] = action.payload
		},
		setAddTarefa(state, action: PayloadAction<any>) {
			state.tarefas = ObjectUtils.normalizeSequencias([...state.tarefas, localIdSetter(action.payload)])
		},
		setAddTarefas(state, action: PayloadAction<any[]>) {
			state.tarefas = ObjectUtils.normalizeSequencias(localIdSetter(action.payload))
		},
		setUpdateUnidadeMaterial(state, action: PayloadAction<{ index: number; unidadeMaterial: any }>) {
			if (!state.form.unidadesMateriais) state.form.unidadesMateriais = []
			const { index, unidadeMaterial } = action.payload
			state.form.unidadesMateriais[index] = unidadeMaterial
		},
		setInspecoes(state, action: PayloadAction<any[]>) {
			state.form.inspecoes = action.payload
		},
		setRemoveInspecao(state, action: PayloadAction<{ idx: number }>) {
			const { idx } = action.payload
			state.form.inspecoes[idx].removed = true
		},
		setUpdateInspecao(state, action: PayloadAction<{ index: number; inspecao: any }>) {
			const { index, inspecao } = action.payload
			state.form.inspecoes[index] = inspecao
		},
		setUpdateDescricao(state, action: PayloadAction<string>) {
			state.form.descricao = action.payload
		},
		setUpdateTarefaFromList(state, action: PayloadAction<any>) {
			const tarefa = action.payload
			const index = indexByLocalId(state, tarefa.__id)

			if (index !== false) {
				state.tarefas[index] = tarefa
			}
		},
		populateToEdit(state, action: PayloadAction<any>) {
			state.form = localIdSetter(action.payload)
		},
		clear(state) {
			state.form = initialState.form
		},
		
	},
})

export const {
	setAcao,
	setUnidadesDeMaterial,
	populateToEdit: populateToEditTarefa,
	clear: clearTarefaForm,
	setUpdateUnidadeMaterial,
	setAddTarefa,
	setAddTarefas,
	setAddJustificativaTarefa,
	setJustificativasTarefa,
	setUpdateJustificativaTarefa,
	setInspecoes,
	setRemoveInspecao,
	setUpdateInspecao,
	setUpdateTarefaFromList,
} = tarefaReducer.actions
export default tarefaReducer.reducer
