import { useState } from 'react'
import { useCoreService } from 'teraprox-core-sdk'

/**
 * Generic hook for POST/PUT operations via the HttpController.
 *
 * @returns {{ executePost: Function, loading: boolean, error: any }}
 */
export const usePostData = () => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)
	const coreService = useCoreService()
	const controller = coreService.createController

	const executePost = async (context: string, url: string, payload: unknown, endpoint?: string): Promise<any> => {
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
