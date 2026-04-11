import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	recursos: [],
	setores: [],
	status: [],
}

const pickersReducer = createSlice({
	name: 'pickersReducer',
	initialState,
	reducers: {
		setRecursos(state, action) {
			state.recursos = action.payload
		},
		setSetores(state, action) {
			state.setores = action.payload
		},
		setStatus(state, action) {
			state.status = action.payload
		},
	},
})

export const { setRecursos, setSetores, setStatus } = pickersReducer.actions
export default pickersReducer.reducer
