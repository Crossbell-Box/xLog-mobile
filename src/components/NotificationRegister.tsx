import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAccountState, useIsConnected } from "@crossbell/react-account";

import { useCharacterId } from "@/hooks/use-character-id";
import { useNotification } from "@/hooks/use-notification";

interface Props {}

export const NotificationRegister: React.FC<Props> = (props) => {
  const _expoPushToken = useNotification().expoPushToken;
  const _characterId = useCharacterId();

  const [characterId, setCharacterId] = useState(_characterId);
  const [expoPushToken, setExpoPushToken] = useState(_expoPushToken);
  const isLoading = useRef(false);

  const isConnected = useIsConnected();

  useEffect(() => {
    setCharacterId(_characterId);
    setExpoPushToken(_expoPushToken);
  }, [_characterId, _expoPushToken]);

  useEffect(() => {
    if (!expoPushToken || !characterId || isLoading.current) {
      return;
    }

    isLoading.current = true;
    fetch(
      `https://indexer.crossbell.io/v1/characters/${characterId}/notifications/devices/${expoPushToken}`,
      { method: isConnected ? "POST" : "DELETE" },
    )
      .then(response => response.json() as unknown as { "ok": boolean })
      .then((response) => {
        if (!isConnected && response.ok) {
          setCharacterId(null);
        }

        // eslint-disable-next-line no-console
        console.log(`${isConnected ? "Register" : "Unregister"} notification: `, response);
      })
      .finally(() => {
        isLoading.current = false;
      });
  }, [
    expoPushToken,
    characterId,
    isConnected,
  ]);

  return null;
};
