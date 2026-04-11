/**
 * wsProvider.js — WebProvider leve para módulo federado.
 *
 * Quando hospedado pelo Core (via FederatedBridge), todas as funções
 * (subscribe, unsubscribe, basicController, etc.) vêm do Core.
 * Firebase RTDB NÃO é inicializado aqui — o Core é o único dono
 * da conexão real-time. Este provider só serve como fallback
 * para execução standalone em dev.
 */
import React, { createContext, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { MatchingObject } from './models/MatchingObject';
import { createBasicController } from './controllers/basicController';
import { MOCK_SOLICITACOES, MOCK_RECURSOS, MOCK_SETORES, MOCK_USER } from '../__mocks__/mockData';
import { setAuth } from '../Reducers/globalConfigReducer';

export { MatchingObject };

const WebProvider = createContext(null);
export { WebProvider };

const endPointManutencao = process.env.REACT_APP_END_POINT_MANUTENCAO;

const IS_STANDALONE = !window.__TERAPROX_HOSTED_BY_CORE__;
const IS_DEVMODE = process.env.REACT_APP_DEVMODE === 'active';

// ─── Mock controller (retorna dados fake para validação de layout) ──────
function createMockController(context) {
  const delay = (data) => new Promise((r) => setTimeout(() => r(data), 200));

  return {
    get: (path) => {
      if (path?.includes('findBetweenDates')) return delay(MOCK_SOLICITACOES);
      return delay([]);
    },
    post: (_p, data) => delay({ ...data, id: Date.now() }),
    put: (_p, data) => delay(data),
    patch: (_p, data) => delay(data),
    delete: () => delay({ ok: true }),
    save: (_p, data) => delay({ ...data, id: data.id || Date.now() }),
    read: (_p, id) => {
      const found = MOCK_SOLICITACOES.find((s) => String(s.id) === String(id));
      return delay(found || { id });
    },
    readAll: (path) => {
      if (path === 'recurso' || context === 'recurso') return delay(MOCK_RECURSOS);
      if (path === 'setor') return delay(MOCK_SETORES);
      return delay(MOCK_SOLICITACOES);
    },
    deleteSimple: () => delay({ ok: true }),
    bulkDelete: () => delay({ ok: true }),
  };
}

/**
 * Fallback provider — usado APENAS quando o módulo roda standalone (npm start).
 * Quando hospedado pelo Core, o FederatedBridge sobrescreve este contexto
 * com o webProviderValue do Core (que já tem Firebase, subscribe, etc.).
 */
export default function WebProviderComponent({ children }) {
  const dispatch = useDispatch();
  const { token, userId } = useSelector((state) => state.global);
  const matchingObjectsRef = useRef([]);

  // Em standalone sem devmode usa mock.
  // Em devmode usa token fixo de desenvolvimento reconhecido pelas APIs locais.
  useEffect(() => {
    if (!IS_STANDALONE || token) return;
    if (IS_DEVMODE) {
      dispatch(setAuth({ ...MOCK_USER, token: 'dev-standalone-token' }));
    } else {
      dispatch(setAuth(MOCK_USER));
    }
  }, [dispatch, token]);

  const api = useRef(null);
  if (!api.current || api.current.__token !== token) {
    const instance = axios.create({ baseURL: endPointManutencao });
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    instance.__token = token;
    api.current = instance;
  }

  const basicController = useCallback(
    (context) => {
      if (IS_STANDALONE && !IS_DEVMODE) return createMockController(context);
      return createBasicController(context, { api: api.current });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api.current]
  );

  const subscribe = useCallback((matchObject) => {
    matchObject.userId = userId;
    const existing = matchingObjectsRef.current.find(
      (mo) => mo.context === matchObject.context && mo.location === matchObject.location
    );
    if (!existing) {
      matchingObjectsRef.current = [...matchingObjectsRef.current, matchObject];
    }
  }, [userId]);

  const unsubscribe = useCallback((matchObject) => {
    matchingObjectsRef.current = matchingObjectsRef.current.filter(
      (mo) => mo.context !== matchObject.context
    );
  }, []);

  const contextValue = {
    socket: null,
    basicController,
    subscribe,
    unsubscribe,
    subscribeEvent: () => {},
    unsubscribeEvent: () => {},
    sendMessage: () => {},
    connectSocket: () => {},
    connectNotificationSocket: () => {},
    handleLogout: () => {},
  };

  return <WebProvider.Provider value={contextValue}>{children}</WebProvider.Provider>;
}
