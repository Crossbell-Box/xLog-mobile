import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";
import i18next from "i18next";

import { cacheStorage } from "@/utils/cache-storage";

import en_common from "./en/common.json";
import en from "./en/index.json";
import zh_common from "./zh/common.json";
import zh from "./zh/index.json";

export const i18n = i18next;

export const LANGUAGES = {
  en: "English",
  zh: "简体中文",
} as const;

export type Language = keyof typeof LANGUAGES;

export const LANGUAGE_STORAGE_KEY = "LANGUAGE_STORAGE_KEY";

const resources = {
  zh: {
    translation: zh,
    common: zh_common,
  },
  en: {
    translation: en,
    common: en_common,
  },
};

const detectedLanguage = cacheStorage.getString(LANGUAGE_STORAGE_KEY) || Localization.getLocales()?.[0]?.languageCode;
const fallbackLng = "en";

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: detectedLanguage,
    fallbackLng,
    defaultNS: "common",
    supportedLngs: Object.keys(resources),
    interpolation: {
      escapeValue: false,
    },
  });
