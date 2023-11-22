import { useState, type FC, type PropsWithChildren, useEffect } from "react";

import { useFonts } from "expo-font";
import * as Location from "expo-location";

import { countries } from "@/constants/countries";
import { i18n } from "@/i18n";
import { cacheStorage } from "@/utils/cache-storage";

export const COUNTRY_INFO_KEY = "countryInfo";

async function getUserCountryCode() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.error("Permission to access location was denied");
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
  const countryCode = reverseGeocode[0]?.isoCountryCode;

  return countryCode;
}

const defaultCountryInfo = i18n.language.startsWith("zh")
  ? countries.cn
  : countries.us;

export const PreloadProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  // const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [fontsLoadingReady] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    InterLight: require("@tamagui/font-inter/otf/Inter-Light.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
  });

  const allReady = fontsLoadingReady;
  // const allReady = fontsLoadingReady || locationPermissionRequested;

  // useEffect(() => {
  //   getUserCountryCode()
  //     .then((countryCode) => {
  //       const countryInfo = countries[countryCode] || defaultCountryInfo;
  //       cacheStorage.set(COUNTRY_INFO_KEY, JSON.stringify(countryInfo));
  //     })
  //     .catch(() => {
  //       cacheStorage.set(COUNTRY_INFO_KEY, JSON.stringify(defaultCountryInfo));
  //     })
  //     .finally(() => {
  //       setLocationPermissionRequested(true);
  //     });
  // }, []);

  if (!allReady)
    return null;

  return children;
};
