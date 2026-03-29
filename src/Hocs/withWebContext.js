/**
 * withWebContext HOC — connects Redux state and webProvider to the wrapped component.
 * Provides: controller, form, state, dispatch, navigate, save, remove, cancelar.
 */
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import useNavigator from '../hooks/useNavigator';
import { useWebProvider } from '../hooks/useWebProvider';

export const withWebContext = (Component) => {
  const WithWebContext = (props) => {
    const { controller } = useWebProvider();
    const toast = useToasts();
    const navigate = useNavigator();
    const dispatch = useDispatch();

    const context = props.context || 'solicitacaoDeServico';
    const form = useSelector((state) => state[context]?.form);
    const state = useSelector((state) => state[context]);
    const baseController = controller(context);

    const remove = () => {
      baseController.delete(context, form.id).then(() => {
        toast.addToast(`Solicitação ${form.id} removida.`, { appearance: 'warning', autoDismiss: true });
      });
      dispatch({ type: `${context}Reducer/clear`, payload: null });
    };

    const cancelar = () => {
      dispatch({ type: `${context}Reducer/clear`, payload: null });
    };

    return (
      <Component
        {...props}
        controller={controller}
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
