import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";
import i18next from "i18next";

import en from "./en.json";
import zh from "./zh.json";

const resources = {
  zh: { translation: zh },
  en: { translation: en },
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
