export const IS_WEB = typeof window !== 'undefined'
export const IS_PROD = process.env.NODE_ENV === 'production'