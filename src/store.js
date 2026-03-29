import { configureStore } from '@reduxjs/toolkit';
import globalConfigReducer from './Reducers/globalConfigReducer';
import solicitacaoDeServicoReducer from './Reducers/solicitacaoDeServicoReducer';

export const store = configureStore({
  reducer: {
    global: globalConfigReducer,
    solicitacaoDeServico: solicitacaoDeServicoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
