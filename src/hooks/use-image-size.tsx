import React, { useState, useEffect } from "react";
import { Image as RNImage } from "react-native";

import { cacheStorage } from "@/utils/cache-storage";

export interface ImageSize {
  width: number
  height: number
  origin?: string
}

export function useImageSize(
  coverImage: string,
  defaultWidth: number,
  defaultHeight: number,
  dimensionsMap?: { [key: string]: { width: number; height: number } },
): ImageSize {
  const defaultSize = { width: defaultWidth, height: defaultHeight };
  const [imageSize, setImageSize] = useState<ImageSize>(defaultSize);

  useEffect(() => {
    async function fetchImageSize() {
      const matchedDimensions = dimensionsMap?.[coverImage];
      const dimensionIsValid = matchedDimensions?.width > 0 && matchedDimensions?.height > 0;

      if (dimensionIsValid) {
        setImageSize({
          origin: "metadata",
          width: matchedDimensions.width,
          height: matchedDimensions.height,
        });
        return;
      }

      const cachedLayout = await cacheStorage.getString(`img-layouts:${coverImage}`);
      if (cachedLayout) {
        setImageSize({
          origin: "cache",
          ...JSON.parse(cachedLayout),
        });
        return;
      }

      if (!coverImage) {
        setImageSize(defaultSize);
        return;
      }

      RNImage.getSize(
        coverImage,
        (width, height) => {
          const scaledHeight = (defaultWidth * height) / width;
          const newSize = { width: defaultWidth, height: scaledHeight };
          setImageSize(newSize);
          cacheStorage.set(`img-layouts:${coverImage}`, JSON.stringify(newSize));
        },
        () => setImageSize(defaultSize),
      );
    }

    fetchImageSize();
  }, [coverImage, dimensionsMap, defaultWidth, defaultHeight]);

  return imageSize;
}
