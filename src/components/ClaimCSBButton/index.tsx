import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useClaimCSBStatus, useAccountState } from "@crossbell/react-account";
import { useRefCallback } from "@crossbell/util-hooks";
import { Coins } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Button } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";

export function ClaimCSBButton() {
  const i18n = useTranslation();
  const { claim, isLoading, isWalletUserEligibleToClaim } = useClaimCSB();

  return (
    <Button
      pressStyle={{ opacity: 0.85 }}
      color={isWalletUserEligibleToClaim ? "$color" : "$colorSubtitle"}
      fontSize={"$6"}
      bg={isWalletUserEligibleToClaim ? "$primary" : undefined}
      borderColor={"$borderColorFocus"}
      disabled={isLoading}
      onPress={claim}
    >
      {isLoading
        ? (
          i18n.t("Loading")
        )
        : (
          i18n.t("Claim CSB")
        )}
    </Button>
  );
}

export function useClaimCSB() {
  const i18n = useTranslation();
  const navigation = useRootNavigation();
  const [account, refillEmailBalance, getRefillEmailBalanceStatus] = useAccountState(s => [s.computed.account, s.refillEmailBalance, s.getRefillEmailBalanceStatus]);
  const { isEligibleToClaim: isWalletUserEligibleToClaim, errorMsg: walletUserUnableToClaimMsg } = useClaimCSBStatus();
  const toast = useToastController();
  const [isLoading, setIsLoading] = useState(false);

  const claim = useRefCallback(async () => {
    if (account?.type === "email") {
      setIsLoading(true);

      const status = await getRefillEmailBalanceStatus();

      if (status.type === "ableToRefill") {
        refillEmailBalance()
          .then(() => toast.show(i18n.t("Claimed Successfully")))
          .finally(() => setIsLoading(false));
      }
      else {
        toast.show(status.msg, {
          burntOptions: {
            preset: "error",
            haptic: "warning",
          },
        });
        setIsLoading(false);
      }
    }
    else {
      if (isWalletUserEligibleToClaim) {
        navigation.navigate("ClaimCSB");
      }
      else {
        toast.show(walletUserUnableToClaimMsg, {
          burntOptions: {
            preset: "error",
            haptic: "warning",
          },
        });
      }
    }
  });

  return { claim, isLoading, isWalletUserEligibleToClaim };
}
