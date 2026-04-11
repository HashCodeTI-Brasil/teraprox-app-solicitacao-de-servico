import { useNavigate } from 'react-router-dom'

/**
 * Thin wrapper around react-router-dom's useNavigate.
 * Returns a navigate function compatible with the rest of the ecosystem.
 */
const useNavigator = () => {
	const navigate = useNavigate()
	return (path, config) => navigate(path, config)
}

export default useNavigator
