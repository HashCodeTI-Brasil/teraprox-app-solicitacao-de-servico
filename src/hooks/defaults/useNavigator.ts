import { useNavigate, NavigateOptions } from 'react-router-dom'

/**
 * Thin wrapper around react-router-dom's useNavigate.
 * Returns a navigate function compatible with the rest of the ecosystem.
 */
const useNavigator = () => {
	const navigate = useNavigate()
	return (path: string, config?: NavigateOptions) => navigate(path, config)
}

export default useNavigator
