const ROUTE_NAMES = {
  INIT_WALLETS: 'INIT_WALLETS',
  ALL_WALLETS: 'ALL_WALLETS',
  QR_CODE: 'QR_CODE',
};

export type Routes = keyof typeof ROUTE_NAMES;
