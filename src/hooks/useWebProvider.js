import { useContext } from 'react';
import { WebProvider } from '../websocket/wsProvider';

const noop = () => {};
const emptyPromise = Promise.resolve([]);
const emptyController = {
  get: () => emptyPromise,
  post: () => emptyPromise,
  put: () => emptyPromise,
  delete: () => emptyPromise,
  save: () => emptyPromise,
  read: () => emptyPromise,
  readAll: () => emptyPromise,
  patch: () => emptyPromise,
  deleteSimple: () => emptyPromise,
  bulkDelete: () => emptyPromise,
};

export const useWebProvider = () => {
  const webProvider = useContext(WebProvider);

  if (!webProvider) {
    return {
      socket: null,
      subscribe: noop,
      unsubscribe: noop,
      controller: () => emptyController,
    };
  }

  return {
    socket: webProvider.socket,
    subscribe: webProvider.subscribe,
    unsubscribe: webProvider.unsubscribe,
    controller: webProvider.basicController,
  };
};
