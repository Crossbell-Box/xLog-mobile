import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

import { Input, Paragraph, YStack } from "tamagui";

import { cacheStorage } from "@/utils/cache-storage";

import { useIsLogin } from "./use-is-login";
import { useToggle } from "./use-toggle";

import { AlertDialog } from "../components/AlertDialog";
import { Button } from "../components/Base/Button";

const NICKNAME_LOCAL_STORAGE_KEY = "anonymousComment.nickname";
const EMAIL_LOCAL_STORAGE_KEY = "anonymousComment.email";

export const getAnonymousCommentInformation = async () => {
  const nickname = await cacheStorage.getString(NICKNAME_LOCAL_STORAGE_KEY);
  const email = await cacheStorage.getString(EMAIL_LOCAL_STORAGE_KEY);

  return {
    nickname,
    email,
  };
};

export const useSetupAnonymousComment = () => {
  const i18n = useTranslation("common");
  const isLogin = useIsLogin();
  const [visible, toggle] = useToggle(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const cb = useRef<() => void>();

  const anonymousCommentDialog = (
    <AlertDialog
      title={i18n.t("Anonymous comment")}
      visible={visible}
      description={(
        <ScrollView scrollEnabled={false}>
          <YStack gap="$3">
            <Paragraph>{i18n.t("Please set your anonymous comment information, which can be modified on the settings page.")}</Paragraph>
            <Input inputMode="text" onChangeText={setNickname} placeholder={i18n.t("Nickname")} defaultValue={nickname}/>
            <Input inputMode="email" onChangeText={setEmail} placeholder={i18n.t("Email")} defaultValue={email}/>
          </YStack>
        </ScrollView>
      )}
      renderCancel={() => <Button onPress={() => toggle(false)}>{i18n.t("Cancel")}</Button>}
      renderConfirm={() => (
        <Button
          type={(!!nickname && !!email) ? "primary" : "disabled"}
          onPress={() => setAnonymousInformation()}
        >
          {i18n.t("Confirm")}
        </Button>
      )}
    />
  );

  const checkWetherAnonymousCommentIsSetup = async () => {
    const { nickname, email } = await getAnonymousCommentInformation();

    return {
      isSetup: nickname && email,
      nickname,
      email,
    };
  };

  const setAnonymousInformation = async () => {
    await cacheStorage.set(NICKNAME_LOCAL_STORAGE_KEY, nickname);
    await cacheStorage.set(EMAIL_LOCAL_STORAGE_KEY, email);
    toggle(false);
    cb.current();
    cb.current = undefined;
  };

  const withAnonymousComment = (_cb: () => void) => {
    return async () => {
      if (!isLogin) {
        const { isSetup, nickname, email } = await checkWetherAnonymousCommentIsSetup();
        if (!isSetup) {
          cb.current = _cb;
          nickname && setNickname(nickname);
          email && setEmail(email);
          toggle(true);
          return;
        }
      }

      _cb();
    };
  };

  return {
    anonymousCommentDialog,
    withAnonymousComment,
  };
};
