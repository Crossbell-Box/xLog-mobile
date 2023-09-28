import type { FC } from "react";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import Animated, { Easing, FadeInDown, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChevronRight, X } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Stack, Text, XStack, YStack } from "tamagui";

import { XTouch } from "@/components/XTouch";
import { GlobalAnimationContext } from "@/context/global-animation-context";
import type { TaskType } from "@/context/post-indicator-context";
import { PostIndicatorContext } from "@/context/post-indicator-context";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import { useRootNavigation } from "@/hooks/use-navigation";
import { getPage } from "@/models/page.model";
import { useCreatePage } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";
import { uploadFiles } from "@/utils/upload-file";

interface PostIndicatorProviderProps extends React.PropsWithChildren {

}

export function PostIndicatorProvider({ children }: PostIndicatorProviderProps) {
  const [task, setTask] = React.useState<TaskType>(null);

  const onIndicatorClose = React.useCallback(() => {
    setTask(null);
  }, []);

  const addPostTask = React.useCallback((params: TaskType) => setTask(params), []);

  return (
    <PostIndicatorContext.Provider value={{ addPostTask }}>
      {children}
      {task && <PostIndicator task={task} onClose={onIndicatorClose} />}
    </PostIndicatorContext.Provider>
  );
}

const PostIndicator: FC<{
  task: TaskType
  onClose?: () => void
}> = ({ task, onClose }) => {
  const { isExpandedAnimValue } = useContext(GlobalAnimationContext).homeFeed;
  const createPage = useCreatePage();
  const { primary } = useColors();
  const i18n = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const [progress, setProgress] = React.useState(10);
  const progressAnimValue = useSharedValue(progress);
  const [publishedResult, setPublishedResult] = React.useState<ExpandedNote>(null);
  const navigation = useRootNavigation();

  useEffect(() => {
    publish();
  }, []);

  useEffect(() => {
    if (createPage.isSuccess) {
      getPage({
        characterId: task.characterId,
        noteId: Number(createPage.data.noteId),
      }).then((note) => {
        setPublishedResult(note);
      });
    }
  }, [createPage.isSuccess]);

  const animStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isExpandedAnimValue.value, [0, 1], [0, 1], "clamp"),
      bottom: interpolate(isExpandedAnimValue.value, [0, 1], [0, bottom + 100], "clamp"),
    };
  }, [bottom]);

  const progressAnimStyles = useAnimatedStyle(() => {
    return {
      width: `${progressAnimValue.value}%`,
      backgroundColor: primary,
    };
  }, [progressAnimValue, primary]);

  const publish = async () => {
    const { assets, characterId, content, title } = task;
    const results = await uploadFiles(
      assets.map(item => item),
      undefined,
      (e) => {
        const fileProgress = (e.currentFileEvent.totalBytesSent / e.currentFileEvent.totalBytesExpectedToSend);
        const completedRatio = ((fileProgress + e.completedTaskCount - 1) / e.totalTaskCount);
        const totalProgress = Math.floor(completedRatio * 100);
        const finalProgress = Math.min(Math.max(totalProgress, 10), 100);
        setProgress(finalProgress);
        progressAnimValue.value = withTiming(finalProgress, { duration: 300 });
      },
    );

    const images = results.map(item => ({
      address: item.url,
      mime_type: item.mimeType,
      dimensions: {
        width: item.dimension.width,
        height: item.dimension.height,
      },
    }));

    createPage.mutate({
      characterId,
      content,
      title,
      type: "short",
      images,
    });
  };

  return (
    <Animated.View
      style={[animStyles, styles.indicatorContainer]}
      entering={FadeInDown}
    >
      <Stack
        overflow="hidden"
        backgroundColor={"rgba(50, 50, 50, 0.4)"}
        borderRadius={10}
        style={StyleSheet.absoluteFill}
        width={"100%"}
        height={"100%"}
        position="absolute"
      >
        <BlurView tint="dark" intensity={30} style={StyleSheet.absoluteFillObject}/>
      </Stack>
      <XStack padding="$3" gap="$2">
        <Image source={{ uri: task.assets[0] }} style={styles.coverImage}/>
        <YStack flex={1}>

          {
            publishedResult
              ? (
                <YStack justifyContent="space-between" flex={1}>
                  <XStack alignItems="flex-start" justifyContent="space-between" flex={1}>
                    <Text>{i18n.t("Successfully published")} 🎉</Text>
                    <XTouch enableHaptics onPress={onClose}>
                      <X size={20} color={"$color"} />
                    </XTouch>
                  </XStack>

                  <XTouch onPress={() => {
                    navigation.navigate("PostDetails", {
                      note: publishedResult,
                      characterId: task.characterId,
                    });
                    onClose();
                  }}>
                    <XStack alignItems="center" justifyContent="flex-end">
                      <Text textAlign="right">{i18n.t("View")}</Text>
                      <ChevronRight size={16}/>
                    </XStack>
                  </XTouch>
                </YStack>
              )
              : (
                <XStack alignItems="flex-start" justifyContent="space-between" flex={1}>
                  <Text>{i18n.t("Uploading")}...</Text>
                  <Text>{progress}%</Text>
                </XStack>
              )
          }

          {!publishedResult && <Animated.View style={[progressAnimStyles, styles.progressBar]}/>}
        </YStack>
      </XStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    width: "95%",
    alignSelf: "center",
    position: "absolute",
    borderRadius: 10,
    overflow: "hidden",
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
  },
});
