import { useState, type FC, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, InteractionManager, StyleSheet, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Plus, Trash } from "@tamagui/lucide-icons";
import { Image } from "expo-image";
import { Button, Input, ScrollView, Stack, XStack, YStack, Text } from "tamagui";

import { Center } from "@/components/Base/Center";
import { useCharacterId } from "@/hooks/use-character-id";
import { usePickImages } from "@/hooks/use-pick-images";
import { usePostIndicatorStore } from "@/hooks/use-post-indicator-store";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
  assets: Array<{
    uri: string
    width: number
    height: number
  }>
}

const { width, height } = Dimensions.get("window");

export const CreateShotsPage: FC<NativeStackScreenProps<RootStackParamList, "CreateShots">> = (props) => {
  const { route, navigation } = props;
  const [assets, setAssets] = useState(route.params.assets);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postEnabled, setPostEnabled] = useState(false);
  const characterId = useCharacterId();
  const { pickImages } = usePickImages();
  const { addPostTask } = usePostIndicatorStore();
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const positions = useRef<{ title: number; content: number }>({ title: 0, content: 0 });

  const i18n = useTranslation();
  const imageSize = (width - 30) / 3;

  const handlePickImages = async () => {
    const result = await pickImages();

    setAssets((assets) => {
      return [...assets, ...result];
    });
  };

  const handleRemoveImage = (index: number) => {
    setAssets((assets) => {
      return assets.filter((_, i) => i !== index);
    });
  };

  const handleOnFocus = (y: number) => {
    scrollViewRef.current?.scrollTo({ y, animated: true });
  };

  const handleOnBlur = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleOnPost = () => {
    InteractionManager.runAfterInteractions(() => {
      navigation.goBack();
    });

    addPostTask({
      assets: assets.map(asset => ({
        uri: asset.uri,
        dimensions: {
          width: asset.width,
          height: asset.height,
        },
      })),
      characterId,
      content,
      title,
      type: "short",
    });
  };

  useEffect(() => {
    setPostEnabled(assets.length > 0 && title.length > 0 && content.length > 0);
  }, [assets, title, content]);

  return (
    <YStack flex={1}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={false}
        paddingTop="$2"
        paddingHorizontal="$2"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Stack marginBottom={"$4"}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <XStack gap="$2">
              {
                assets.map((asset, index) => {
                  return (
                    <Stack key={`${index}-${asset.uri}`}>
                      <Image
                        style={{
                          width: imageSize,
                          height: imageSize,
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                        contentFit="cover"
                        source={{ uri: asset.uri }}
                      />
                      <TouchableWithoutFeedback containerStyle={{ position: "absolute", right: 6, bottom: 6 }} onPress={() => handleRemoveImage(index)}>
                        <Trash color="white"/>
                      </TouchableWithoutFeedback>
                    </Stack>
                  );
                })
              }
              <Center onPress={handlePickImages} width={imageSize} height={imageSize} backgroundColor={"$backgroundTransparent"} borderRadius={10}>
                <Plus size={40} color="white" />
              </Center>
            </XStack>
          </ScrollView>
        </Stack>

        <View
          onLayout={(e) => {
            positions.current.title = e.nativeEvent.layout.y;
          }}
        >
          <XStack alignItems="center">
            <Input
              placeholder={i18n.t("Add a title")}
              unstyled
              color={"$color"}
              fontSize={"$7"}
              flex={1}
              onFocus={() => handleOnFocus(positions.current.title)}
              onChangeText={setTitle}
              maxLength={30}
              onBlur={handleOnBlur}
            />
            <Text color="$color" opacity={0.5}>({title.length}/30)</Text>
          </XStack>
        </View>

        <Stack marginVertical={"$3"} borderBottomWidth={StyleSheet.hairlineWidth} borderBottomColor={"$borderColor"}/>

        <View
          onLayout={(e) => {
            positions.current.content = e.nativeEvent.layout.y;
          }}
          style={{ minHeight: height }}
        >
          <Input
            placeholder={i18n.t("Add text")}
            unstyled
            color={"$color"}
            fontSize={"$5"}
            onFocus={() => handleOnFocus(positions.current.content)}
            onChangeText={setContent}
            onBlur={handleOnBlur}
            maxLength={1000}
            multiline
            flex={1}
          />
        </View>
      </ScrollView>

      <XStack width={"100%"} position="absolute" bottom={0} paddingBottom={"$2"}>
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }} >
          <Button
            backgroundColor={postEnabled ? "$primary" : undefined}
            onPress={handleOnPost}
            disabled={!postEnabled}
            size={"$5"}
            width={"95%"}
            fontSize={"$7"}
            alignSelf="center"
          >
            {i18n.t("Post")}
          </Button>
        </SafeAreaView>
      </XStack>
    </YStack>
  );
};
