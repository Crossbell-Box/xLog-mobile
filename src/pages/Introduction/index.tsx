import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { Plug2, Settings, Sparkles, Wallet } from "@tamagui/lucide-icons";
import { Image } from "expo-image";
import { Paragraph, ScrollView, Spacer, Text, XStack, YStack } from "tamagui";

import { ConnectEmailButton } from "@/components/ConnectEmailButton";
import { LoginButton } from "@/components/LoginButton";
import { LogoDarkBlueResource, LogoLightBlueResource } from "@/components/Logo";
import { PolarLightBackground } from "@/components/PolarLightBackground";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useThemeStore } from "@/hooks/use-theme-store";

export interface Props {
}

export const TERMS_PAGE_TITLE = "Terms & Conditions";

export const IntroductionPage: FC<Props> = () => {
  const navigation = useRootNavigation();
  const { isDarkMode } = useThemeStore();
  const i18n = useTranslation("translation");
  const navigateToTerms = () => navigation.navigate("Web", { url: "https://rss3.notion.site/Legal-Public-f30edd47c3be4dd7ae5ed4e39aefbbd9?pvs=4", title: i18n.t(TERMS_PAGE_TITLE) });

  return (
    <ScrollView bounces={false} backgroundColor={"$background"} showsVerticalScrollIndicator={false}>
      <YStack>
        <SafeAreaView style={{ paddingTop: 16, paddingBottom: 100 }}>
          {isDarkMode && <PolarLightBackground activeIndex={0}/>}
          <YStack paddingHorizontal="$6">
            <XStack alignItems="flex-end" justifyContent="space-between" marginBottom="$5">
              <Image
                source={
                  isDarkMode
                    ? LogoLightBlueResource
                    : LogoDarkBlueResource
                }
                style={{
                  width: 48,
                  height: 48,
                }}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("SettingsNavigator")}
              >
                <Settings/>
              </TouchableOpacity>
            </XStack>
            <Text marginBottom="$6" fontWeight={"500"} fontSize={37}>
              {
                i18n.t("You're using xLog on {{ platform }}", {
                  platform: Platform.OS === "ios" ? "iOS" : "Android",
                })
              }
            </Text>
            {
              [
                {
                  icon: Sparkles,
                  title: "Write when inspiration strikes",
                  description: "Frees you from time-consuming, unnecessary processes that slow your writing, so you and your team can focus on creating.",
                },
                {
                  icon: Wallet,
                  title: "Own content on the blockchain",
                  description: "You own your content by publishing content on the Crossbell blockchain. xLog won't store any data and can't take away or modify your rights and content, even if xLog wanted to.",
                },
                {
                  icon: Plug2,
                  title: "Integration",
                  description: "xLog's open design allows it to integrate with many other open protocols and applications without friction.",
                },
              ].map(({ icon: Icon, title, description }, index) => {
                return (
                  <XStack key={index} marginBottom="$6" alignItems="center" gap="$3" >
                    <Icon size={32}/>
                    <YStack flex={1} gap="$1">
                      <Text fontSize={16} fontWeight={"700"}>{i18n.t(title)}</Text>
                      <Text fontSize={12}>{i18n.t(description)}</Text>
                    </YStack>
                  </XStack>
                );
              })
            }
            <LoginButton />
            <Spacer/>
            <ConnectEmailButton />
            <Spacer size="$4"/>
            <Text color="$colorSubtitle" fontSize={"$2"} textAlign="center" onPress={navigateToTerms}>
              <Trans
                ns="translation"
                i18nKey="Agree to out Terms & Conditions"
                values={{ terms: i18n.t("Terms & Conditions", { ns: "translation" }) }}
                components={{
                  T: <Text textDecorationLine="underline" color="$color" fontSize={"$3"}/>,
                }}
              />
            </Text>
          </YStack>
        </SafeAreaView>
      </YStack>
    </ScrollView>
  );
};
