import { useState, useEffect } from "react";
import { Image as RNImage } from "react-native";

import { cacheStorage } from "@/utils/cache-storage";

export interface ImageSize {
  width: number
  height: number
  origin?: string
}

export function useImageSize(
  originalCoverImage: string,
  defaultWidth: number,
  defaultHeight: number,
  dimensionsMap?: { [key: string]: { width: number; height: number } },
): ImageSize {
  const [imageSize, setImageSize] = useState<ImageSize>(getSizeFromDimensionsMap());

  function getSizeFromDimensionsMap() {
    const matchedDimensions = dimensionsMap?.[originalCoverImage];
    const dimensionIsValid = matchedDimensions?.width > 0 && matchedDimensions?.height > 0;

    if (dimensionIsValid) {
      return {
        origin: "metadata",
        width: matchedDimensions.width,
        height: matchedDimensions.height,
      };
    }
    else {
      return {
        width: defaultWidth,
        height: defaultHeight,
      };
    }
  }

  useEffect(() => {
    async function fetchImageSize() {
      if (imageSize) {
        return;
      }

      const cachedLayout = await cacheStorage.getString(`img-layouts:${originalCoverImage}`);
      if (cachedLayout) {
        setImageSize({
          origin: "cache",
          ...JSON.parse(cachedLayout),
        });
        return;
      }

      if (!originalCoverImage) {
        return;
      }

      RNImage.getSize(
        originalCoverImage,
        (width, height) => {
          const scaledHeight = (defaultWidth * height) / width;
          const newSize = { width: defaultWidth, height: scaledHeight };
          setImageSize(newSize);
          cacheStorage.set(`img-layouts:${originalCoverImage}`, JSON.stringify(newSize));
        },
      );
    }

    fetchImageSize();
  }, [originalCoverImage, dimensionsMap, defaultWidth, defaultHeight, imageSize]);

  return imageSize;
}
