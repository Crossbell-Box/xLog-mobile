const compressorDomain = "https://xlog.app/_next/image";

export function getCompressedImageUrl(
  source: string,
  width: "640" | "750" | "828" | "1080" | "1200" | "1920" | "2048" | "3840",
  quality: "25" | "50" | "75" = "75",
) {
  if (!source) {
    return null;
  }

  return `${compressorDomain}?url=${encodeURIComponent(source)}&w=${width}&q=${quality}`;
}

export function withCompressedImage(
  source: string,
  level: "low" | "medium" | "high" = "medium",
) {
  if (level === "low") {
    return getCompressedImageUrl(source, "640", "25");
  }

  if (level === "medium") {
    return getCompressedImageUrl(source, "1200", "50");
  }

  return getCompressedImageUrl(source, "1920", "75");
}
