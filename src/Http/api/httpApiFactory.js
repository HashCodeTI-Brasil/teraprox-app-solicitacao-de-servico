import axios from "axios"

/**
 * Cria uma instância axios para comunicação REST com interceptors de auth, resposta e erro.
 *
 * @param {string} endPoint - URL base do endpoint REST
 * @param {object} deps - Dependências injetadas
 * @param {object} deps.store - Redux store
 * @param {function} deps.dispatch - Redux dispatch
 * @param {object} deps.toast - Objeto toast para notificações
 * @param {function} deps.enqueueSuccessToast - Toast de sucesso com debounce
 * @param {function} deps.processResponseMatchingObjects - Processa MOs da response
 * @param {function} deps.setToken - Action creator para atualizar token
 * @param {function} deps.setNeedUserLogin - Action creator para relogin
 * @returns {import("axios").AxiosInstance} Instância axios configurada
 */
export const createHttpApi = (endPoint, {
    store,
    dispatch,
    toast,
    enqueueSuccessToast,
    processResponseMatchingObjects,
    setToken,
    setNeedUserLogin,
    hostedByCore,
}) => {
    console.log('[DEBUG createHttpApi] baseURL:', endPoint)
    const http = axios.create({
        baseURL: endPoint,
    })

    http.interceptors.response.use(
        res => {
            if (
                res.config.method !== "get" &&
                res.config.method !== "patch"
            ) {
                enqueueSuccessToast("Dados processados com sucesso", {
                    autoDismiss: true,
                    duration: 2000,
                    appearance: "success",
                })
            }
            if (res.data?.newToken) dispatch(setToken(res.data?.newToken))
            processResponseMatchingObjects(res.data.matchingObjects)
            return res?.data?.content ? res.data.content : res.data
        },
        err => {
            const status = err.response?.status;
            const data = err.response?.data;

            // Trata 400 e 404 COMO fluxos normais
            if (status === 400 || status === 404) {
                if (status === 400 && Array.isArray(data.errors)) {
                    data.errors.forEach(msg =>
                        toast.warning(msg)
                    );
                }
                if (status === 404) {
                    toast.info('Recurso não encontrado.');
                }
                return Promise.resolve(data);
            }

            if (status === 401) {
                // Dev standalone: ignore 401, API should not require auth
                if (process.env.NODE_ENV === 'development' && !hostedByCore) {
                    return Promise.resolve(data ?? {});
                }
                dispatch(setNeedUserLogin(true));
                return new Promise((resolve, reject) => {
                    const unsubscribe = store.subscribe(() => {
                        const state = store.getState();
                        const token = state.global.token;
                        const needLogin = state.global.needUserLogin;
                        if (token && !needLogin) {
                            unsubscribe();
                            err.config.headers['Authorization'] = `${token}`;
                            http.request(err.config).then(resolve).catch(reject);
                        } else if (!token && !needLogin) {
                            unsubscribe();
                            reject({ message: err.message, status, data, stack: err.stack });
                        }
                    });
                });
            }
            if (status === 403) {
                toast.warning('Você não tem permissão para acessar este recurso.');
            }
            if (status === 500 && Array.isArray(data.errors)) {
                data.errors.forEach(errMsg =>
                    toast.error(errMsg)
                );
            }

            const customError = { message: err.message, status, data, stack: err.stack };
            const msg = data?.message || err.message || 'Erro de rede';
            toast.error(`[${status || 'Network'}] ${msg}`);
            return Promise.reject(customError);
        }
    );

    http.interceptors.request.use(async (config) => {
        const token = store.getState().global.token
        if (token) {
            config.headers.Authorization = `${token}`
        }
        return config
    })

    return http
}
