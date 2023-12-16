import { useState, type FC, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Languages } from "@tamagui/lucide-icons";
import { Text } from "tamagui";

import { AlertDialog } from "@/components/AlertDialog";
import { Button } from "@/components/Base/Button";
import { DelayedRender } from "@/components/DelayRender";
import { XTouch } from "@/components/XTouch";
import type { ExpandedNote } from "@/types/crossbell";

export const I18nSwitcher: FC<{
  note: ExpandedNote
}> = ({ note }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const i18n = useTranslation("translation");

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  if (!note.metadata.content.translatedFrom || !note.metadata.content.translatedTo) return null;

  return (
    <>
      <XTouch onPress={openModal}>
        <Languages size={16} color={"#929190"} />
      </XTouch>
      <DelayedRender when={modalVisible}>
        <AlertDialog
          visible={modalVisible}
          title={undefined}
          containerStyle={{
            paddingHorizontal: 4,
          }}
          description={(
            <Text lineHeight={"$2"}>
              <Trans
                i18nKey={"Translated by"}
                ns="translation"
                values={{
                  from: i18n.t(note.metadata.content.translatedFrom),
                  to: i18n.t(note.metadata.content.translatedTo),
                }}
              />
            </Text>
          )}
          renderCancel={null}
          renderConfirm={() => (
            <Button size={"$3"} backgroundColor={"$primary"} onPress={closeModal}>{i18n.t("Cancel", { ns: "common" })}</Button>
          )}
        />
      </DelayedRender>
    </>
  );
};
