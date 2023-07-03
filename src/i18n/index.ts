import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";
import i18next from "i18next";

import en_common from "./en/common.json";
import en_dashboard from "./en/dashboard.json";
import en from "./en/index.json";
import en_site from "./en/site.json";
import zh_common from "./zh/common.json";
import zh_dashboard from "./zh/dashboard.json";
import zh from "./zh/index.json";
import zh_site from "./zh/site.json";

const resources = {
  zh: {
    translation: zh,
    common: zh_common,
    site: zh_site,
    dashboard: zh_dashboard,
  },
  en: {
    translation: en,
    common: en_common,
    site: en_site,
    dashboard: en_dashboard,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale,
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export const i18n = i18next;
