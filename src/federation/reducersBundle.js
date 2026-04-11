import { createReducersBundle } from 'teraprox-core-sdk/federation'

const bundle = createReducersBundle({
  reducers: {
    // Domínio Solicitação de Serviço
    solicitacaoDeServico: () =>
      import(/* webpackMode: "eager" */ '../Reducers/solicitacaoDeServicoReducer'),
    // Defaults
    globalError:  () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/globalErrorReducer'),
    notification: () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/notificationReducer'),
    picker:       () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/genericPickerReducer'),
    pickers:      () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/pickersReducer'),
    timer:        () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/timerReducer'),
  },
  contextMap: {
    solicitacaoDeServico: ['solicitacaoDeServico'],
  },
  defaults: ['solicitacaoDeServico', 'globalError', 'notification', 'picker', 'pickers', 'timer'],
})

export const { getReducerKeysByContext, getReducersForKeys, getReducersForModule, loadAllReducers } =
  bundle
export const baseReducers = {}
export default baseReducers
