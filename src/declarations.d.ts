// CSS / asset module declarations
declare module '*.css'
declare module '*.png'
declare module '*.svg'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'

// Webpack-injected process.env (Create React App / react-app-rewired convention)
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test'
    [key: string]: string | undefined
  }
}

// Global window extensions injected by teraprox-core
interface Window {
  __TERAPROX_HOSTED_BY_CORE__?: boolean
}
