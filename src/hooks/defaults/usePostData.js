import { useState } from 'react'
import { useWebProvider } from './useWebProvider'

/**
 * Generic hook for POST/PUT operations via the HttpController.
 *
 * @returns {{ executePost: Function, loading: boolean, error: any }}
 */
export const usePostData = () => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const { controller } = useWebProvider()

	const executePost = async (context, url, payload, endpoint) => {
		setLoading(true)
		try {
			const abstractController = endpoint ? controller(context, endpoint) : controller(context)
			const response = await abstractController.post(url, payload)
			return response
		} catch (err) {
			setError(err)
		} finally {
			setLoading(false)
		}
	}

	return { executePost, loading, error }
}
