/**
 * @deprecated withWebContext HOC — RETIRED as of Fase 3 (11-04-2026).
 * All screens previously using this HOC have been refactored to use ViewModel hooks:
 *  - SolicitacaoDeServicoForm → useSolicitacaoFormViewModel()
 *  - AprovacaoStatus          → useAprovacaoViewModel()
 * This file is kept for historical reference only and can be safely deleted.
 */
import { useDispatch, useSelector } from 'react-redux';
import { useCoreService, useToast } from 'teraprox-core-sdk';
import useNavigator from '../hooks/useNavigator';

export const withWebContext = (Component) => {
  const WithWebContext = (props) => {
    const { createController } = useCoreService();
    const toast = useToast();
    const navigate = useNavigator();
    const dispatch = useDispatch();

    const context = props.context || 'solicitacaoDeServico';
    const form = useSelector((state) => state[context]?.form);
    const state = useSelector((state) => state[context]);
    const baseController = createController(context);

    const remove = () => {
      baseController.delete(context, form.id).then(() => {
        toast.warning(`Solicitação ${form.id} removida.`);
      });
      dispatch({ type: `${context}Reducer/clear`, payload: null });
    };

    const cancelar = () => {
      dispatch({ type: `${context}Reducer/clear`, payload: null });
    };

    return (
      <Component
        {...props}
        controller={createController}
        contextController={baseController}
        state={state}
        context={context}
        form={form}
        toast={toast}
        remove={remove}
        cancelar={cancelar}
        dispatch={dispatch}
        navigate={navigate}
      />
    );
  };

  return WithWebContext;
};
