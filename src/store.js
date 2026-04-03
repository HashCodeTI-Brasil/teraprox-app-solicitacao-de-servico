import { configureStore } from '@reduxjs/toolkit';
import globalConfigReducer from './Reducers/globalConfigReducer';
import solicitacaoDeServicoReducer from './Reducers/solicitacaoDeServicoReducer';
import { branchLevelReducer } from '@teraprox/core-sdk';

export const store = configureStore({
  reducer: {
    global: globalConfigReducer,
    solicitacaoDeServico: solicitacaoDeServicoReducer,
    branchLevel: branchLevelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
