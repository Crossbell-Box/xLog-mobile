import { useEvent, useHandler } from "react-native-reanimated";

export function useComposedScrollHandler(
  onScrollRefList,
) {
  const { doDependenciesDiffer } = useHandler({}, onScrollRefList);

  return useEvent(
    (event) => {
      "worklet";

      for (const ref of onScrollRefList)
        ref.current?.worklet?.(event);
    },
    ["onScroll", "onScrollBeginDrag", "onScrollEndDrag", "onMomentumScrollBegin", "onMomentumScrollEnd"],
    doDependenciesDiffer,
  );
}
