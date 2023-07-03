import type { FC } from "react";
import React, { useState, useEffect } from "react";
import { Image, View, Dimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import type { ImageProps } from "expo-image";
import { Image as ExpoImage } from "expo-image";

interface Props extends Omit<ImageProps, "source"> {
  uri: string
}

export const AutoFillImage: FC<Props> = ({ uri, ...restExpoImageProps }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(Dimensions.get("window").width);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Image.getSize(uri, (width, height) => {
      setDimensions({ width, height });
      setIsLoading(false);
    });
  }, [uri]);

  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const imageHeight = containerWidth * (dimensions.height / dimensions.width);

  if (isLoading) {
    return null;
  }

  return (
    <Animated.View onLayout={onLayout} entering={FadeIn.duration(500)}>
      <ExpoImage
        source={{ uri }}
        {...restExpoImageProps}
        style={{
          width: containerWidth,
          height: imageHeight,
          ...restExpoImageProps.style ?? {},
        }}
      />
    </Animated.View>
  );
};
