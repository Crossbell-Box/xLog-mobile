import { useCallback } from "react";

import type { CharacterEntity } from "crossbell";

import { useRootNavigation } from "./use-navigation";

export const useNavigateToUserInfo = (character?: CharacterEntity) => {
  const navigation = useRootNavigation();
  const navigateToUserInfo = useCallback(() => {
    if (!character) {
      return;
    }

    navigation.navigate("UserInfo", { character });
  }, [
    character,
    navigation,
  ]);

  return {
    navigateToUserInfo,
  };
};
