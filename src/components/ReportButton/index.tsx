import React, { useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ArrowRight, Flag } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Button, H4, ListItem, Stack, XStack, YGroup } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useColors } from "@/hooks/use-colors";

const NFT_REPORT_LIST = [
  "I just don't like it",
  "It's spam",
  "Not safe for work",
  "Scam or fraud",
  "It's not original content",
];

interface Props {}

export const ReportButton: React.FC<Props> = () => {
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const toast = useToastController();
  const { background, borderColor, color, subtitle } = useColors();
  const [commentsInputVisible, setCommentsInputVisible] = useState(false);
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const onSubmit = () => {
    bottomSheetRef.current?.close();

    toast.show("Report submitted!", {
      burntOptions: {
        preset: "done",
        haptic: "success",
      },
    });
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={openBottomSheet} hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}>
        <XStack alignItems="center" gap="$1.5">
          <Flag
            size={"$1"}
            color={"$color"}
          />
        </XStack>
      </TouchableWithoutFeedback>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: background }}
      >
        <ScrollView>
          <Stack padding="$3" gap="$3">
            <H4>Why are you reporting this?</H4>
            <YGroup alignSelf="center" bordered>
              {
                NFT_REPORT_LIST.map((item, index) => (
                  <YGroup.Item key={item}>
                    <ListItem onPress={onSubmit} hoverTheme title={item} size={"$5"} iconAfter={<ArrowRight/>}/>
                  </YGroup.Item>
                ))
              }
            </YGroup>
            <YGroup alignSelf="center" bordered>
              <YGroup.Item>
                <ListItem hoverTheme title={"Something else"} size={"$5"} onPress={() => setCommentsInputVisible(true)}/>
              </YGroup.Item>
            </YGroup>
            {
              commentsInputVisible && (
                <>
                  <BottomSheetTextInput
                    placeholder={"What are you trying to report?"}
                    multiline
                    placeholderTextColor={subtitle}
                    style={[styles.input, { borderColor, color }]}
                  />
                  <Button onPress={onSubmit}>Submit</Button>
                </>
              )
            }
          </Stack>
        </ScrollView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    letterSpacing: 0.5,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    paddingTop: 12,
  },
});
