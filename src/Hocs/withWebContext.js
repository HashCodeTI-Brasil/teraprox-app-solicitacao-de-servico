/**
 * withWebContext HOC — connects Redux state and CoreService to the wrapped component.
 * Provides: controller, form, state, dispatch, navigate, save, remove, cancelar.
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
