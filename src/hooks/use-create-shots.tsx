import { useCallback } from "react";

import { useRootNavigation } from "./use-navigation";
import { usePickImages } from "./use-pick-images";

export const useCreateShots = () => {
  const navigation = useRootNavigation();
  const { pickImages: pickImage } = usePickImages();

  const createShots = useCallback(async () => {
    const assets = await pickImage();
    if (assets.length === 0) return;
    navigation.navigate("CreateShots", { assets });
  }, []);

  return { createShots };
};
