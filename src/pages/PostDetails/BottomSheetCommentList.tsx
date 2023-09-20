import { forwardRef, type FC, useImperativeHandle, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CommentListInstance } from "@/components/CommentList";
import { CommentList } from "@/components/CommentList";
import { DelayedRender } from "@/components/DelayRender";
import { FilledSpinner } from "@/components/WithSpinner";
import type { ExpandedNote } from "@/types/crossbell";

interface Props {
  note: ExpandedNote
}

export interface BottomSheetCommentListInstance {
  comment: () => void
}

export const BottomSheetCommentList = forwardRef<
BottomSheetCommentListInstance,
Props
>((
  { note },
  ref,
) => {
  const commentListRef = useRef<CommentListInstance>(null);

  useImperativeHandle(ref, () => ({
    comment: () => {
      commentListRef.current?.comment();
    },
  }));

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <DelayedRender timeout={100} placeholder={<FilledSpinner />}>
        <CommentList animated isInBottomSheet ref={commentListRef} couldComment noteId={note.noteId} characterId={note.characterId} />
      </DelayedRender>
    </SafeAreaView>
  );
});
