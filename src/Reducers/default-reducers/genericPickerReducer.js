import { createSlice } from '@reduxjs/toolkit'

export function createPickerState(id, view, location = '') {
	return {
		id,
		view,
		location,
		options: [],
	}
}

const initialState = {
	pickerState: {},
}

const genericPickerReducer = createSlice({
	name: 'genericPickerReducer',
	initialState,
	reducers: {
		appendPickerState(state, action) {
			const { id } = action.payload
			state.pickerState[id] = action.payload
		},
		removePickerState(state, action) {
			delete state.pickerState[action.payload]
		},
		closePicker(state, action) {
			state.pickerState[action.payload].view = true
		},
		closeAllPickers(state) {
			Object.entries(state.pickerState).forEach((e) => (e[1].view = true))
		},
		openPicker(state, action) {
			state.pickerState[action.payload].view = false
		},
		clearPickerState(state) {
			state.pickerState = {}
		},
	},
})

export const {
	appendPickerState,
	removePickerState,
	closeAllPickers,
	closePicker,
	openPicker,
	clearPickerState,
} = genericPickerReducer.actions

export default genericPickerReducer.reducer
