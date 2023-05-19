import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToastController } from "@tamagui/toast";
import type { CharacterEntity } from "crossbell.js";

import { useGetSubscription, useSubscribeToSite, useUnsubscribeFromSite } from "@/queries/site";

import { useFnLoadingWithStateChange } from "./use-fn-loading-with-state-change";

export const useFollow = ({ character }: { character: CharacterEntity }) => {
  const subscribeToSite = useSubscribeToSite();
  const unsubscribeFromSite = useUnsubscribeFromSite();
  const { t } = useTranslation("common");
  const toast = useToastController();

  const handleClickSubscribe = useFnLoadingWithStateChange(() => {
    if (character?.characterId) {
      if (subscription.data) {
        return unsubscribeFromSite.mutateAsync({
          characterId: character?.characterId,
          siteId: character?.handle,
        } as any);
      }
      else {
        return subscribeToSite.mutateAsync({
          characterId: character?.characterId,
          siteId: character?.handle,
        } as any);
      }
    }
  });

  const subscription = useGetSubscription(character?.characterId);

  useEffect(() => {
    if (subscribeToSite.isError) {
      subscribeToSite.reset();
    }
  }, [subscribeToSite]);

  useEffect(() => {
    if (subscribeToSite.isSuccess) {
      subscribeToSite.reset();
      toast.show(t("Successfully followed"), {
        status: "success",
      });
    }
  }, [subscribeToSite, t]);

  const isLoading = subscription.data
    ? unsubscribeFromSite.isLoading || subscribeToSite.isLoading
    : unsubscribeFromSite.isLoading
      || subscribeToSite.isLoading
      || subscription.isLoading;

  const isFollowing = !!subscription.data;

  return {
    isFollowing,
    isLoading,
    toggleSubscribe: handleClickSubscribe,
  };
};
