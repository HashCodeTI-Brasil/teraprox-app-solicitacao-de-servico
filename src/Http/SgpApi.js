import axios from "axios";

import { routesConfig } from "../models/routesConfig";
import { store } from "../store";


export const setRestApi = (context, baseEndPoint) => {
   
   let endPointToConfig = null
   if (baseEndPoint) {
      endPointToConfig = baseEndPoint
   } else {
      routesConfig.forEach(rC => rC.routes.forEach(route => {
         if (route.configuration.context == context) {
            endPointToConfig = route.configuration.endPoint
         }
      }))
   }
   
   const http = axios.create({
      baseURL: endPointToConfig,
   });

   http.interceptors.response.use((response) => {
      
      return response.data.content ? response.data.content : response.data

   },error => {
      
      return error
   });


   http.interceptors.request.use(async (config) => {
      const token = store.getState().global.token;
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
   },error => {
      return error
   });

   return http;
};

