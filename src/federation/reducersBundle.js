/**
 * ReducersBundle — exposes reducer loading functions for the Core to inject
 * into the host Redux store when this module is loaded via Module Federation.
 */

const reducerImporters = {
  solicitacaoDeServico: () =>
    import(/* webpackMode: "eager" */ '../Reducers/solicitacaoDeServicoReducer'),
};

const defaultReducerKeys = ['solicitacaoDeServico'];

const contextReducerKeys = {
  solicitacaoDeServico: ['solicitacaoDeServico'],
};

const getReducerKeysByContextInternal = (context) => {
  const contextKeys = contextReducerKeys[context];
  if (!contextKeys) return defaultReducerKeys;
  return [...new Set([...defaultReducerKeys, ...contextKeys])];
};

export const getReducerKeysByContext = (context) =>
  getReducerKeysByContextInternal(context);

export const getReducersForKeys = async (keys = []) => {
  const uniqueKeys = [...new Set(keys)].filter((key) => !!reducerImporters[key]);
  const loaded = await Promise.all(
    uniqueKeys.map(async (key) => {
      const module = await reducerImporters[key]();
      return [key, module.default || module];
    })
  );
  return Object.fromEntries(loaded);
};

export const getReducersForModule = async ({ context } = {}) => {
  const keys = getReducerKeysByContextInternal(context);
  return getReducersForKeys(keys);
};

export const loadAllReducers = () => getReducersForKeys(Object.keys(reducerImporters));

export const baseReducers = {};
export default baseReducers;
