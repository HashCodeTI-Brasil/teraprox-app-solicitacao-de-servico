import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	form: {},
	picker: {
		notificacao: null,
	},
	unreadNotifications: [],
	archivedNotifications: [],
	unreadCount: 0,
}

const notificationReducer = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		setUnreadNotifications(state, action) {
			state.unreadNotifications = action.payload
		},
		setArchivedNotifications(state, action) {
			state.archivedNotifications = action.payload
		},
		addNotification(state, action) {
			state.unreadNotifications.unshift(action.payload)
			state.unreadCount += 1
		},
		setUnreadCount(state, action) {
			state.unreadCount = action.payload
		},
		markAsRead(state, action) {
			const notification = state.unreadNotifications.find((n) => n._id === action.payload)
			if (notification && notification.status !== 'read') {
				notification.status = 'read'
				state.unreadCount = Math.max(0, state.unreadCount - 1)
				state.unreadNotifications = state.unreadNotifications.filter((n) => n._id !== action.payload)
			}
		},
		dismissNotification(state, action) {
			const notification = state.unreadNotifications.find((n) => n._id === action.payload)
			if (notification) {
				notification.status = 'dismissed'
			}
		},
		markAllAsRead(state, action) {
			const idsToMarkAsRead = action.payload
			const newUnreadeds = state.unreadNotifications.filter(
				(notification) => !idsToMarkAsRead.includes(notification._id)
			)
			state.unreadNotifications = newUnreadeds
			state.unreadCount = newUnreadeds.length
		},
		setNotificationPicked(state, action) {
			state.picker.notificacao = action.payload
		},
		clearNotifications(state) {
			state.unreadNotifications = []
			state.unreadCount = 0
		},
	},
})

export const {
	setUnreadNotifications,
	setArchivedNotifications,
	addNotification,
	setUnreadCount,
	markAsRead,
	dismissNotification,
	markAllAsRead,
	setNotificationPicked,
	clearNotifications,
} = notificationReducer.actions

export default notificationReducer.reducer
