export interface WalletInfo {
  app: {
    android: string | null;
    browser: string;
    chrome: string | null;
    edge: string | null;
    firefox: string | null;
    ios: string | null;
    linux: string;
    mac: string | null;
    opera: string | null;
    safari: string | null;
    windows: string;
  };
  app_type: string;
  chains: string[];
  description: string;
  desktop: {
    native: string;
    universal: string;
  };
  homepage: string;
  id: string;
  image_id: string;
  image_url: {
    lg: string;
    md: string;
    sm: string;
  };
  injected: null;
  metadata: {
    shortName: string;
  };
  mobile: {
    native: string;
    universal: string;
  };
  name: string;
  sdks: string[];
  supported_standards: string[];
  versions: string[];

  //Added field for app purposes
  isInstalled?: boolean;
}
