import { useMemo } from "react";

import { useCharacterNotification as useCrossbellCharacterNotification } from "@crossbell/indexer";
import type { NotificationTypeKey } from "crossbell";

export type CharacterNotificationType = "LIKED" | "COMMENTED" | "MENTIONED";

export const useCharacterNotification = (characterId: number, type: CharacterNotificationType) => {
  const kinds = useMemo<NotificationTypeKey[]>(() => {
    switch (type) {
      case "LIKED":
        return ["LINKED", "UNLINKED"];
      case "COMMENTED":
        return ["NOTE_POSTED"];
      case "MENTIONED":
        return ["MENTIONED"];
      default:
        return [];
    }
  }, [type]);

  return useCrossbellCharacterNotification(characterId, kinds);
};
