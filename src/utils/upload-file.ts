import { Image } from "react-native-compressor";
import * as mime from "react-native-mime-types";

import * as FileSystem from "expo-file-system";

import type { Asset } from "@/context/post-indicator-context";

/**
 * Only support image file currently.
*/
export const uploadFile = async (
  file: Asset,
  onProgressChange?: (event: FileSystem.UploadProgressData) => void,
) => {
  const compressedImage = await Image.compress(file.uri, { input: "uri" });
  const mimeType = mime.lookup(compressedImage) || undefined;
  const task = FileSystem.createUploadTask(
    "https://ipfs-relay.crossbell.io/upload?gnfd=t",
    compressedImage,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
    },
    onProgressChange,
  );

  const result = await task.uploadAsync();

  const url = JSON.parse(result.body)?.url as string;

  return {
    url,
    mimeType,
    dimension: file.dimensions,
  };
};

/**
 * Only support image file currently.
*/
export const uploadFiles = async (
  files: Asset[],
  onProgressChange?: (file: Asset, event: FileSystem.UploadProgressData) => void,
  onTotalProgressChange?: (event: {
    file: Asset
    totalTaskCount: number
    completedTaskCount: number
    currentFileEvent: FileSystem.UploadProgressData
  }) => void,
) => {
  const totalTaskCount = files.length;
  let completedTaskCount = 0;

  return Promise.all(
    files.map((file) => {
      return uploadFile(file, (event) => {
        const isCompleted = event.totalBytesSent === event.totalBytesExpectedToSend;
        if (isCompleted) {
          completedTaskCount += 1;
          onTotalProgressChange?.({
            file,
            totalTaskCount,
            completedTaskCount,
            currentFileEvent: event,
          });
        }

        onProgressChange?.(file, event);
      });
    },
    ));
};
