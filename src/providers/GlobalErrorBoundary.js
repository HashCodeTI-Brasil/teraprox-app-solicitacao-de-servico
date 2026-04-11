import React from 'react'

class GlobalErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		}
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error }
	}

	componentDidCatch(error, errorInfo) {
		const errorKey = `${error.message}-${errorInfo?.componentStack}`
		const isDuplicate = this.lastError === errorKey

		if (!isDuplicate) {
			this.setState({ error, errorInfo })
		}

		this.lastError = errorKey

		// Auto-reload on chunk load errors (deploy invalidated old chunks)
		if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
			const reloadKey = 'chunk_reload_ts'
			const lastReload = sessionStorage.getItem(reloadKey)
			const now = Date.now()
			if (!lastReload || now - Number(lastReload) > 10000) {
				sessionStorage.setItem(reloadKey, String(now))
				window.location.reload()
			}
		}
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 32, textAlign: 'center' }}>
					<h4>Algo deu errado.</h4>
					<p style={{ color: '#6b7280', fontSize: 14 }}>
						Recarregue a página ou entre em contato com o suporte.
					</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							marginTop: 16,
							padding: '8px 24px',
							background: '#3b82f6',
							color: '#fff',
							border: 'none',
							borderRadius: 4,
							cursor: 'pointer',
						}}
					>
						Recarregar
					</button>
				</div>
			)
		}
		return this.props.children
	}
}

export default GlobalErrorBoundary
