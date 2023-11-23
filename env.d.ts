declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_SCHEME: string
      WALLET_PROJECT_ID: string
      EXPO_PROJECT_ID: string
      OWNER: string
      UPDATES_URL: string
      INFURA_ID: string
      CSB_SCAN: string
      CSB_XCHAR: string
      SENTRY_DSN: string
      APP_HOST: string
      NAKED_APP_HOST: string
      OIA_HOST: string
      NAKED_OIA_HOST: string
    }
  }
}

export {};
