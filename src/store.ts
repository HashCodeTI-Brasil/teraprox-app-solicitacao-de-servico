import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import globalConfigReducer from './Reducers/globalConfigReducer';
import solicitacaoDeServicoReducer from './Reducers/solicitacaoDeServicoReducer';
import notificationReducer from './Reducers/default-reducers/notificationReducer';
import globalErrorReducer from './Reducers/default-reducers/globalErrorReducer';
import genericPickerReducer from './Reducers/default-reducers/genericPickerReducer';
import pickersReducer from './Reducers/default-reducers/pickersReducer';
import timerReducer from './Reducers/default-reducers/timerReducer';
import tarefaReducer from './Reducers/tarefaReducer';
import justificativaReducer from './Reducers/justificativaReducer';
import { branchLevelReducer } from 'teraprox-core-sdk';

const PERSIST_KEY = 'teraprox-ss-root';

const baseReducers = combineReducers({
  global: globalConfigReducer,
  solicitacaoDeServico: solicitacaoDeServicoReducer,
  notification: notificationReducer,
  globalError: globalErrorReducer,
  picker: genericPickerReducer,
  pickers: pickersReducer,
  timer: timerReducer,
  branchLevel: branchLevelReducer,
  tarefa: tarefaReducer,
  justificativa: justificativaReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action?.type === 'eraseStore') {
    state = undefined;
  }
  return baseReducers(state, action);
};

const persistConfig = {
  key: PERSIST_KEY,
  storage,
  whitelist: ['global'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof baseReducers>;
export type AppDispatch = typeof store.dispatch;
