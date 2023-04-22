import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import en from "./en";
import zh from "./zh";

export const i18n = new I18n({
  zh,
  en,
});

const deviceLanguage = getLocales()[0].languageCode;
i18n.locale = deviceLanguage;
i18n.defaultLocale = "en";
i18n.enableFallback = true;
