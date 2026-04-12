import { useState } from 'react'
import { useCoreService } from 'teraprox-core-sdk'

/**
 * Generic hook for fetching data via the HttpController.
 *
 * @returns {{ data: any, loading: boolean, error: any, fetchData: Function }}
 */
export const useFetchData = () => {
	const coreService = useCoreService()
	const controller = coreService.createController
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)

	const fetchData = async (context: string, url: string, endpoint?: string): Promise<any> => {
		const dynamicController = endpoint ? controller(context, endpoint) : controller(context)
		setLoading(true)
		setError(null)
		try {
			const result = await dynamicController.get(url)
			setData(result)
			return result
		} catch (err) {
			setError(err)
			throw err
		} finally {
			setLoading(false)
		}
	}

	const reset = () => {
		setData(null)
		setError(null)
	}

	return { data, loading, error, fetchData, reset }
}
