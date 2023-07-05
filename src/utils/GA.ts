import analytics from "@react-native-firebase/analytics";

import { IS_PROD } from "@/constants";

const fakerFn = (...args) => {
  // eslint-disable-next-line no-console
  console.log("[GA]: ", args.map(arg => JSON.stringify(arg)).join(", "));
  return Promise.resolve();
};

export const GA = IS_PROD
  ? analytics()
  : {
    logEvent: fakerFn,
    logShare: fakerFn,
    logLogin: fakerFn,
    logSearch: fakerFn,
    logSelectItem: fakerFn,
    logScreenView: fakerFn,
  };
