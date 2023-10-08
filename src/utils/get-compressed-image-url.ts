const compressorDomain = "https://xlog.app/_next/image";

export function getCompressedImageUrl(
  source: string,
  width: "640" | "750" | "828" | "1080" | "1200" | "1920" | "2048" | "3840",
  quality: "10" | "20" | "30" | "40" | "50" | "60" | "70" | "80" | "90" | "100" = "100",
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
    return getCompressedImageUrl(source, "640", "10");
  }

  if (level === "medium") {
    return getCompressedImageUrl(source, "640", "20");
  }

  return getCompressedImageUrl(source, "640", "30");
}
