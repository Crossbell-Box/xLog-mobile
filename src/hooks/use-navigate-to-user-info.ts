import { useCallback } from "react";

import type { CharacterEntity } from "crossbell";

import { useRootNavigation } from "./use-navigation";

export const useNavigateToUserInfo = (character?: CharacterEntity) => {
  const navigation = useRootNavigation();
  const navigateToUserInfo = useCallback(() => {
    if (!character?.characterId) {
      return;
    }

    navigation.navigate("UserInfo", { characterId: character?.characterId });
  }, [
    character?.characterId,
    navigation,
  ]);

  return {
    navigateToUserInfo,
  };
};
