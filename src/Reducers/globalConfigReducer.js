import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuth: false,
  token: null,
  userId: null,
  fullName: null,
  userName: null,
  companyId: null,
  company: null,
  companyName: null,
  setor: 'default',
  role: null,
  context: null,
  socketConnection: false,
  filters: [],
};

const globalConfigSlice = createSlice({
  name: 'globalConfigReducer',
  initialState,
  reducers: {
    setAuth(state, action) {
      const { token, userId, fullName, userName, companyId, company, companyName, setor, role } = action.payload;
      state.isAuth = true;
      state.token = token;
      state.userId = userId;
      state.fullName = fullName;
      state.userName = userName;
      state.companyId = companyId;
      state.company = company;
      state.companyName = companyName;
      state.setor = setor || 'default';
      state.role = role;
    },
    logOut(state) {
      Object.assign(state, initialState);
    },
    setContext(state, action) {
      state.context = action.payload;
    },
    setSocketConnectionStatus(state, action) {
      state.socketConnection = action.payload;
    },
    setAddFilter(state, action) {
      state.filters.push(action.payload);
    },
  },
});

export const { setAuth, logOut, setContext, setSocketConnectionStatus, setAddFilter } = globalConfigSlice.actions;
export default globalConfigSlice.reducer;
