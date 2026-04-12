import { createReducersFromManifest } from 'teraprox-core-sdk'
import { manifest } from './manifest'

const bundle = createReducersFromManifest(
  manifest,
  {
    solicitacaoDeServico: () => import(/* webpackMode: "eager" */ '../Reducers/solicitacaoDeServicoReducer'),
    tarefa:               () => import(/* webpackMode: "eager" */ '../Reducers/tarefaReducer'),
    justificativa:        () => import(/* webpackMode: "eager" */ '../Reducers/justificativaReducer'),
    globalError:          () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/globalErrorReducer'),
    notification:         () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/notificationReducer'),
    picker:               () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/genericPickerReducer'),
    pickers:              () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/pickersReducer'),
    timer:                () => import(/* webpackMode: "eager" */ '../Reducers/default-reducers/timerReducer'),
  },
)

export const { getReducerKeysByContext, getReducersForKeys, getReducersForModule, loadAllReducers } =
  bundle
export const baseReducers = {}
export default baseReducers
