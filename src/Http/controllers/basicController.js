/**
 * Cria o controller CRUD básico que utiliza REST HTTP.
 * Eventos em tempo real são recebidos via Firebase RTDB (matching objects).
 *
 * @param {string} context - Contexto da rota (ex: "ordemDeServico")
 * @param {object} deps - Dependências injetadas
 * @param {import("axios").AxiosInstance} deps.api - Instância axios REST
 * @returns {object} Objeto com métodos CRUD (get, post, put, patch, save, read, readAll, readAllwithPage, delete, deleteSimple, bulkDelete)
 */
export const createBasicController = (context, { api }) => {
    return {
        get: (path, query, extraHeaders) => {
            let pathh = path ? path : context
            return api.get(`${pathh}${query ? "?" + query : ""}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        post: (path, data, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.post(`${pathh}${query ? "?" + query : ""}`, data, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        put: (path, data, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.put(`${pathh}${query ? "?" + query : ""}`, data, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        patch: (path, data, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.patch(`${pathh}${query ? "?" + query : ""}`, data, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        deleteSimple: (path, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.delete(`${pathh}${query ? "?" + query : ""}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        save: (path, data, extraHeaders, query) => {
            let pathh = path ? path : context
            const id = data.id || data._id
            const haveFalseId = id === 0 || id === "0" || id === "form"

            if (id && !haveFalseId) {
                return api.put(
                    `${pathh}/${id}${query ? "?" + query : ""}`,
                    data,
                    { headers: { Contexto: context, ...extraHeaders } }
                )
            } else {
                let dataToSave = { ...data }
                if (haveFalseId) {
                    delete dataToSave.id
                    delete dataToSave._id
                }
                return api.post(
                    `${pathh}${query ? "?" + query : ""}`,
                    dataToSave,
                    { headers: { Contexto: context, ...extraHeaders } }
                )
            }
        },

        read: (path, id, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.get(`${pathh}/${id}${query ? "?" + query : ""}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        readAll: (path, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.get(`${pathh}${query ? "?" + query : ""}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        readAllwithPage: (path, page, size, extraHeaders) => {
            let pathh = path ? path : context
            const pageQuery = `page=${page}&size=${size}`
            return api.get(`${pathh}?${pageQuery}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        delete: (path, id, extraHeaders, query) => {
            let pathh = path ? path : context
            return api.delete(`${pathh}/${id}${query ? "?" + query : ""}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },

        bulkDelete: (path, ids, extraHeaders = {}, query = "") => {
            const pathh = path || context
            const bulkParam = `ids=${ids.join(",")}`
            const fullQuery = query ? `${query}&${bulkParam}` : bulkParam
            return api.delete(`${pathh}?${fullQuery}`, {
                headers: { Contexto: context, ...extraHeaders },
            })
        },
    }
}
