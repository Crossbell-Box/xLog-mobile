import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/en";
import "dayjs/locale/zh";
import "dayjs/locale/zh-tw";
import "dayjs/locale/ja";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(duration);
dayjs.extend(relativeTime);

type DateInput = string | Date;

interface UseDate {
  dayjs: typeof dayjs
  formatDate: (date: DateInput, format?: string, timeZone?: string) => string
  formatToISO: (date: DateInput) => string
  inLocalTimezone: (date: DateInput) => Date
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string
}

export function useDate(): UseDate {
  const [_, { language: locale }] = useTranslation();

  dayjs.locale(locale);

  const formatDate = (date: DateInput, format = "ll", timeZone?: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    };

    if (format === "ll")
      options.month = "short";

    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
  };

  const formatToISO = (date: DateInput): string => {
    return new Date(date).toISOString();
  };

  const inLocalTimezone = (date: DateInput): Date => {
    return new Date(date);
  };

  const formatRelativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return rtf.format(value, unit);
  };

  return {
    dayjs,
    formatDate,
    formatToISO,
    inLocalTimezone,
    formatRelativeTime,
  };
}
