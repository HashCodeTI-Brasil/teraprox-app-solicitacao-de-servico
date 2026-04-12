import { setRestApi } from "./SgpApi"

export const basicController = (context, baseEndPoint) => {
	let api = setRestApi(context, baseEndPoint)

	return {
		get: (path, extraHeaders) => {
			let pathh = path ? path : context

			return api
				.get(`${pathh}`, { headers: { Contexto: context, ...extraHeaders  } })
				.catch((err) => {
					console.log("erro" + err)
				})
		},
		post: (path, data, extraHeaders) => {
			let pathh = path ? path : context
			return api.post(`${pathh}`, data, {
				headers: { Contexto: context, ...extraHeaders },
			})
		},
		put: (path, data) => {
			let pathh = path ? path : context
			return api.put(`${pathh}`, data, { headers: { Contexto: context } })
		},
		delete: (path) => {
			let pathh = path ? path : context
			return api.delete(`${pathh}`, { headers: { Contexto: context } })
		},
		save: (path, data, extraHeaders) => {
			let pathh = path ? path : context
			if (data.id || data._id) {
				return api.put(`${pathh}/${data.id || data._id}`, data, {
					headers: { Contexto: context, ...extraHeaders },
				})
			} else {
				return api.post(pathh, data, {
					headers: { Contexto: context, ...extraHeaders },
				})
			}
		},
		read: (path, id) => {
			let pathh = path ? path : context
			return api.get(`${pathh}/${id}`, { headers: { Contexto: context } })
		},
		readAll: (path, extraHeaders) => {
			let pathh = path ? path : context
			return api
				.get(`${pathh}`, {
					headers: { Contexto: context, ...extraHeaders },
				})
				.catch((err) => {
					console.log("erro" + err)
				})
		},
		readAllwithPage: (path, page, size) => {
			let pathh = path ? path : context
			return api.get(`${pathh}?page=${page}&size=${size}`, {
				headers: { Contexto: context },
			})
		},
		delete: (path, id) => {
			let pathh = path ? path : context
			return api.delete(`${pathh}/${id}`, {
				headers: { Contexto: context },
			})
		},
	}
}
