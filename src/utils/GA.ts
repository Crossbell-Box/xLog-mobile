import analytics from "@react-native-firebase/analytics";

import { IS_PROD } from "@/constants";

const analyticsInstance = analytics();

analyticsInstance.setAnalyticsCollectionEnabled(IS_PROD);

export const GA = analyticsInstance;
