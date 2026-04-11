import { useContext } from 'react'
import { CoreServiceContext } from 'teraprox-core-sdk'
import { MatchingObject, WebProvider } from '../../websocket/wsProvider'

export { MatchingObject }

/**
 * Proxy hook — delegates to the Core's WebProvider context when hosted
 * by the Core (via FederatedBridge), or falls back to the local standalone
 * WebSocketProvider for dev/standalone mode.
 *
 * Returns always the same interface regardless of the hosting context.
 */
export const useWebProvider = () => {
	const webProvider = useContext(WebProvider)
	const coreService = useContext(CoreServiceContext)

	if (!webProvider) {
		const noop = () => {}
		const hostedByCore =
			typeof window !== 'undefined' && window.__TERAPROX_HOSTED_BY_CORE__ === true

		if (coreService) {
			return {
				socket: null,
				notificationSocket: null,
				hostedByCore: true,
				sendMessage: noop,
				subscribe: coreService.subscribe || noop,
				unsubscribe: coreService.unsubscribe || noop,
				controller: coreService.createController,
				connectSocket: noop,
				connectNotificationSocket: noop,
				handleLogout: coreService.handleLogout || noop,
				subscribeEvent: coreService.subscribeEvent || noop,
				unsubscribeEvent: coreService.unsubscribeEvent || noop,
				wsProvider: null,
			}
		}

		return {
			socket: null,
			notificationSocket: null,
			hostedByCore,
			sendMessage: noop,
			subscribe: noop,
			unsubscribe: noop,
			controller: () => {
				const emptyPromise = Promise.resolve([])
				return {
					get: () => emptyPromise,
					post: () => emptyPromise,
					put: () => emptyPromise,
					delete: () => emptyPromise,
					save: () => emptyPromise,
					read: () => emptyPromise,
					readAll: () => emptyPromise,
					readAllwithPage: () => emptyPromise,
					patch: () => emptyPromise,
					bulkDelete: () => emptyPromise,
					deleteSimple: () => emptyPromise,
				}
			},
			connectSocket: noop,
			connectNotificationSocket: noop,
			handleLogout: noop,
			subscribeEvent: noop,
			unsubscribeEvent: noop,
			wsProvider: null,
		}
	}

	const subscribe = (matchObject) => webProvider.subscribe(matchObject)
	const unsubscribe = (matchObject) => webProvider.unsubscribe(matchObject)
	const subscribeEvent = (context, location, eventHandler) =>
		webProvider.subscribeEvent?.(context, location, eventHandler)
	const unsubscribeEvent = (context, location, eventHandler) =>
		webProvider.unsubscribeEvent?.(context, location, eventHandler)
	const sendMessage = (matchObject) => webProvider.sendMessage?.(matchObject)
	const connectSocket = (userName, company) => webProvider.connectSocket?.(userName, company)
	const connectNotificationSocket = (userName, company) =>
		webProvider.connectNotificationSocket?.(userName, company)
	const handleLogout = () => webProvider.handleLogout?.()

	return {
		socket: webProvider.socket,
		notificationSocket: webProvider.notificationSocket || null,
		hostedByCore:
			!!webProvider.hostedByCore ||
			(typeof window !== 'undefined' && window.__TERAPROX_HOSTED_BY_CORE__ === true),
		sendMessage,
		subscribe,
		unsubscribe,
		controller: webProvider.basicController,
		connectSocket,
		connectNotificationSocket,
		handleLogout,
		subscribeEvent,
		unsubscribeEvent,
		wsProvider: webProvider,
	}
}
