declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_SCHEME: string
      WALLET_PROJECT_ID: string
      EXPO_PROJECT_ID: string
      OWNER: string
      UPDATES_URL: string
      INFURA_ID: string
    }
  }
}

export {};
