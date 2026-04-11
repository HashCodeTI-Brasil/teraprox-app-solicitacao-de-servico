import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	savedTimers: [],
}

const timerReducer = createSlice({
	name: 'timerReducer',
	initialState,
	reducers: {
		appendToSavedTimers(state, action) {
			if (!state.savedTimers) state.savedTimers = []
			state.savedTimers = [...state.savedTimers, action.payload]
		},
		setSavedTimers(state, action) {
			if (!state.savedTimers) state.savedTimers = []
			state.savedTimers = action.payload
		},
		setUpdateSavedTimer(state, action) {
			const { _id } = action.payload
			const indexToUpdate = state.savedTimers.findIndex((t) => t._id === _id)
			state.savedTimers[indexToUpdate] = action.payload
		},
		clear(state) {
			state.savedTimers = initialState.savedTimers
		},
	},
})

export const {
	clear: clearTimerReducerForm,
	appendToSavedTimers,
	setSavedTimers,
	setUpdateSavedTimer,
} = timerReducer.actions

export default timerReducer.reducer
