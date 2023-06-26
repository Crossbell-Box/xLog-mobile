import { useCharacterNotification } from "./use-character-notification";

export const useCharacterNotificationCount = (characterId: number) => {
  const notifications = useCharacterNotification(characterId);

  return notifications?.data?.pages?.[0]?.count || 0;
};
