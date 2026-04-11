import { createSlice } from '@reduxjs/toolkit'

export const globalErrorReducer = createSlice({
	name: 'globalError',
	initialState: null,
	reducers: {
		setGlobalError: (state, action) => action.payload,
		clearGlobalError: () => null,
	},
})

export const { setGlobalError, clearGlobalError } = globalErrorReducer.actions
export default globalErrorReducer.reducer
