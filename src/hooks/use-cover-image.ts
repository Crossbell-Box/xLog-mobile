import type { ExpandedNote } from "@/types/crossbell";
import { withCompressedImage } from "@/utils/get-compressed-image-url";
import { toGateway } from "@/utils/ipfs-parser";

export const useCoverImage = (note: ExpandedNote) => {
  const originalImage = note?.metadata?.content?.images?.[0];
  const optimizedImage = withCompressedImage(toGateway(originalImage), "high");

  return {
    originalImage,
    optimizedImage,
  };
};
