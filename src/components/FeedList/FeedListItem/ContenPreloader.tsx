import { useEffect, type FC, useState } from "react";
import DeviceInfo from "react-native-device-info";

import { Stack } from "tamagui";

import { WebView } from "@/components/WebView";
import { VERSION } from "@/constants";
import { usePostWebViewLink } from "@/hooks/use-post-link";

interface Props {
  noteId: number
  characterId: number
}

export const ContentPreloader: FC<Props> = ({ noteId, characterId }) => {
  const [userAgent, setUserAgent] = useState<string>(null);
  const postUri = usePostWebViewLink({ noteId, characterId });

  useEffect(() => {
    DeviceInfo.getUserAgent().then((us) => {
      setUserAgent(`${us} ReactNative/${VERSION}`);
    });
  }, []);

  if (!postUri || !userAgent) return null;

  return (
    <Stack opacity={0} position="absolute" width={0} height={0}>
      <WebView
        javaScriptEnabled={false}
        userAgent={userAgent}
        source={{ uri: postUri }}
        cacheEnabled
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        mediaPlaybackRequiresUserAction
        allowsInlineMediaPlayback
        allowsAirPlayForMediaPlayback={false}
      />
    </Stack>
  );
};
