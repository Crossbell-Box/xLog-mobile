declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PROJECT_ID: string
      BUNDLE_IDENTIFIER: string
      OWNER: string
      UPDATES_URL: string
      WALLET_PROJECT_ID: string
      APP_SCHEME: string
      INFURA_ID: string
      MAGIC_PUB_KEY: string
    }
  }
}

export {};
