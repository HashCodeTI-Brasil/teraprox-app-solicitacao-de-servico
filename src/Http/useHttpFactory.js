import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { createHttpApi } from './api/httpApiFactory';
import { createBasicController } from './controllers/basicController';
import { setToken, setNeedUserLogin } from '../Reducers/default-reducers/globalConfigReducer';

export function useHttpFactory() {
    const store = useStore();
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    
    // Simplifed mock since we remove the websocket loop
    const enqueueSuccessToast = (msg, opts) => addToast(msg, opts);
    const processResponseMatchingObjects = () => {};
    const hostedByCore = typeof window !== 'undefined' && window.__TERAPROX_HOSTED_BY_CORE__ === true;

    const createController = useCallback((context, baseEndpoint) => {
        const endpoint = baseEndpoint || process.env.REACT_APP_API_URL || '';
        const api = createHttpApi(endpoint, {
            store,
            dispatch,
            toast: {
                success: (msg) => addToast(msg, { appearance: 'success', autoDismiss: true }),
                warning: (msg) => addToast(msg, { appearance: 'warning', autoDismiss: true }),
                error: (msg) => addToast(msg, { appearance: 'error', autoDismiss: true }),
                info: (msg) => addToast(msg, { appearance: 'info', autoDismiss: true }),
            },
            enqueueSuccessToast,
            processResponseMatchingObjects,
            setToken,
            setNeedUserLogin,
            hostedByCore
        });
        
        return createBasicController(context, { api });
    }, [store, dispatch, addToast, hostedByCore]);

    return createController;
}
