import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";
import i18next from "i18next";

import en from "./en/index.json";
import zh_common from "./zh/common.json";
import zh from "./zh/index.json";

const resources = {
  zh: {
    translation: zh,
    common: zh_common,
  },
  en: {
    translation: en,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export const i18n = i18next;
