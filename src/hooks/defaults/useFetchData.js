import { useState } from 'react'
import { useWebProvider } from './useWebProvider'

/**
 * Generic hook for fetching data via the HttpController.
 *
 * @returns {{ data: any, loading: boolean, error: any, fetchData: Function }}
 */
export const useFetchData = () => {
	const { controller } = useWebProvider()
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const fetchData = async (context, url, endpoint) => {
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
