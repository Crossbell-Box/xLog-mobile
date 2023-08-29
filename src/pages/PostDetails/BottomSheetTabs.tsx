import { useCallback, type FC, useRef, forwardRef, useImperativeHandle } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import { Spacer, Stack } from "tamagui";

import { DelayedRender } from "@/components/DelayRender";
import type { ExpandedNote } from "@/types/crossbell";

import { BlockChainInfo } from "./BlockChainInfo";
import type { BottomSheetCommentListInstance } from "./BottomSheetCommentList";
import { BottomSheetCommentList } from "./BottomSheetCommentList";
import { BottomSheetLikeList } from "./BottomSheetLikeList";
import { BottomSheetTabBar } from "./BottomSheetTabBar";

const { width } = Dimensions.get("window");

interface Props {
  note?: ExpandedNote
}

export interface BottomSheetTabsInstance {
  setActivity: (index: number) => void
  comment: () => void
}

export const BottomSheetTabs = forwardRef<BottomSheetTabsInstance, Props>(({ note }, ref) => {
  const scrollRef = useRef<ScrollView>(null);
  const bottomSheetCommentListInstance = useRef<BottomSheetCommentListInstance>(null);
  const actionIndicatorIndexAnimVal = useSharedValue<number>(1);

  useImperativeHandle(ref, () => ({
    setActivity: (index) => {
      scrollRef.current?.scrollTo({
        x: index * width,
        y: 0,
        animated: false,
      });
    },
    comment: () => {
      bottomSheetCommentListInstance.current?.comment();
    },
  }));

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x } = event.nativeEvent.contentOffset;
    actionIndicatorIndexAnimVal.value = x / width;
  }, []);

  return (
    <Stack flex={1}>
      <BottomSheetTabBar
        characterId={note?.characterId}
        noteId={note?.noteId}
        indexAnimVal={actionIndicatorIndexAnimVal}
        onPressTab={(index) => {
          scrollRef.current?.scrollTo({
            x: index * width,
            y: 0,
            animated: true,
          });
        }}
      />
      <Spacer size="$3"/>
      {
        note && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ flexGrow: 1 }}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentOffset={{
              x: actionIndicatorIndexAnimVal.value * width,
              y: 0,
            }}
          >
            {
              [
                <BlockChainInfo key={"0"} note={note}/>,
                <BottomSheetCommentList key={"1"} ref={bottomSheetCommentListInstance} note={note}/>,
                <BottomSheetLikeList key={"2"} note={note}/>,
              ].map((item, index) => {
                return (
                  <Stack key={index} width={width}>
                    {item}
                  </Stack>
                );
              })
            }
          </ScrollView>
        )
      }
    </Stack>
  );
});
