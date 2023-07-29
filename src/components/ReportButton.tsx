import React, { useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ArrowRight, Flag } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Button, H4, ListItem, Stack, XStack, YGroup } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useColors } from "@/hooks/use-colors";
import { GA } from "@/utils/GA";

import { XTouch } from "./XTouch";

const REPORT_LIST = [
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
  const [text, setText] = useState("");
  const gaWithScreenParams = useGAWithScreenParams();
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const onSubmit = (reportContent: string, isCustom: boolean) => {
    GA.logEvent("report", {
      is_custom: isCustom,
      report_content: reportContent,
      ...gaWithScreenParams,
    });

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
      <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} onPress={openBottomSheet}>
        <XStack alignItems="center" gap="$1.5">
          <Flag
            size={"$1"}
            color={"$color"}
          />
        </XStack>
      </XTouch>

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
                REPORT_LIST.map((item, index) => (
                  <YGroup.Item key={item}>
                    <ListItem onPress={() => onSubmit(item, false)} hoverTheme title={item} size={"$5"} iconAfter={<ArrowRight/>}/>
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
                    onChangeText={setText}
                    placeholderTextColor={subtitle}
                    style={[styles.input, { borderColor, color }]}
                  />
                  <Button onPress={() => {
                    onSubmit(text, true);
                    setText("");
                  }}>Submit</Button>
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
