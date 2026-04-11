import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuth: false,
  token: null,
  userId: null,
  id: null,
  fullName: null,
  firstName: null,
  lastName: null,
  userName: null,
  email: null,
  companyId: null,
  company: null,
  companyName: null,
  setor: 'default',
  setorId: null,
  role: null,
  context: null,
  contextToUpdate: null,
  prevPage: null,
  pageLocation: null,
  socketConnection: false,
  needUserLogin: false,
  filters: [],
};

const globalConfigSlice = createSlice({
  name: 'globalConfigReducer',
  initialState,
  reducers: {
    /** Full auth payload — used by DevAutoLogin from SDK */
    logIn(state, action) {
      const p = action.payload;
      state.isAuth = true;
      state.token = p.token;
      state.userId = p.id || p.userId;
      state.id = p.id || p.userId;
      state.firstName = p.firstName;
      state.lastName = p.lastName;
      state.fullName = p.fullName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
      state.userName = p.userName;
      state.email = p.email;
      state.companyId = p.companyId;
      state.companyName = p.companyName;
      state.setor = p.setor || 'default';
      state.setorId = p.userSetor?.setorId || null;
      state.role = p.role;
      state.filters = p.filters || [];
    },
    /** Alias — keeps backward compat with existing SS screens */
    setAuth(state, action) {
      const p = action.payload;
      state.isAuth = true;
      state.token = p.token;
      state.userId = p.userId || p.id;
      state.id = p.userId || p.id;
      state.fullName = p.fullName;
      state.firstName = p.firstName;
      state.lastName = p.lastName;
      state.userName = p.userName;
      state.email = p.email;
      state.companyId = p.companyId;
      state.company = p.company;
      state.companyName = p.companyName;
      state.setor = p.setor || 'default';
      state.role = p.role;
    },
    logOut(state) {
      Object.assign(state, initialState);
    },
    setCompany(state, action) {
      state.company = action.payload;
      state.companyId = action.payload;
    },
    setContext(state, action) {
      state.context = action.payload;
    },
    setContextToUpdate(state, action) {
      state.contextToUpdate = action.payload;
    },
    setSocketConnectionStatus(state, action) {
      state.socketConnection = action.payload;
    },
    setNeedUserLogin(state, action) {
      state.needUserLogin = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setPrevPage(state, action) {
      state.prevPage = action.payload;
    },
    setPageLocation(state, action) {
      state.pageLocation = action.payload;
    },
    setUpdateCompanySetor(state, action) {
      state.setor = action.payload;
    },
    setAddFilter(state, action) {
      state.filters.push(action.payload);
    },
    setUpdateFilters(state, action) {
      state.filters = action.payload;
    },
  },
});

export const {
  logIn,
  setAuth,
  logOut,
  setCompany,
  setContext,
  setContextToUpdate,
  setSocketConnectionStatus,
  setNeedUserLogin,
  setToken,
  setPrevPage,
  setPageLocation,
  setUpdateCompanySetor,
  setAddFilter,
  setUpdateFilters,
} = globalConfigSlice.actions;

export default globalConfigSlice.reducer;
