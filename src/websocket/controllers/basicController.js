/**
 * Creates the basic CRUD HTTP controller.
 *
 * @param {string} context - Route context (e.g. 'solicitacaoDeServico')
 * @param {{ api: import('axios').AxiosInstance }} deps
 */
export const createBasicController = (context, { api }) => ({
  get: (path, query, extraHeaders) => {
    const pathh = path || context;
    return api.get(`${pathh}${query ? '?' + query : ''}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  post: (path, data, extraHeaders, query) => {
    const pathh = path || context;
    return api.post(`${pathh}${query ? '?' + query : ''}`, data, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  put: (path, data, extraHeaders, query) => {
    const pathh = path || context;
    return api.put(`${pathh}${query ? '?' + query : ''}`, data, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  patch: (path, data, extraHeaders, query) => {
    const pathh = path || context;
    return api.patch(`${pathh}${query ? '?' + query : ''}`, data, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  delete: (path, id, extraHeaders, query) => {
    const pathh = path || context;
    return api.delete(`${pathh}/${id}${query ? '?' + query : ''}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  save: (path, data, extraHeaders, query) => {
    const pathh = path || context;
    const id = data.id || data._id;
    const haveFalseId = id === 0 || id === '0' || id === 'form';
    if (id && !haveFalseId) {
      return api.put(`${pathh}/${id}${query ? '?' + query : ''}`, data, {
        headers: { Contexto: context, ...extraHeaders },
      });
    }
    const dataToSave = { ...data };
    if (haveFalseId) { delete dataToSave.id; delete dataToSave._id; }
    return api.post(`${pathh}${query ? '?' + query : ''}`, dataToSave, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  read: (path, id, extraHeaders, query) => {
    const pathh = path || context;
    return api.get(`${pathh}/${id}${query ? '?' + query : ''}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  readAll: (path, extraHeaders, query) => {
    const pathh = path || context;
    return api.get(`${pathh}${query ? '?' + query : ''}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  deleteSimple: (path, extraHeaders, query) => {
    const pathh = path || context;
    return api.delete(`${pathh}${query ? '?' + query : ''}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
  bulkDelete: (path, ids, extraHeaders = {}, query = '') => {
    const pathh = path || context;
    const bulkParam = `ids=${ids.join(',')}`;
    const fullQuery = query ? `${query}&${bulkParam}` : bulkParam;
    return api.delete(`${pathh}?${fullQuery}`, {
      headers: { Contexto: context, ...extraHeaders },
    });
  },
});
