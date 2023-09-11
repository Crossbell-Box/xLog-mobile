import { Image } from "react-native-compressor";
import * as mime from "react-native-mime-types";

import * as FileSystem from "expo-file-system";

/**
 * Only support image file currently.
*/
export const uploadFile = async (
  uri: string,
  onProgressChange?: (event: FileSystem.UploadProgressData) => void,
) => {
  const compressedImage = await Image.compress(uri);
  const mimeType = mime.lookup(compressedImage) || undefined;
  const task = FileSystem.createUploadTask(
    "https://ipfs-relay.crossbell.io/upload?gnfd=t",
    compressedImage,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      httpMethod: "POST",
      mimeType,
    },
    onProgressChange,
  );

  const result = await task.uploadAsync();
  const url = JSON.parse(result.body)?.url as string;

  return {
    url,
    mimeType,
  };
};

/**
 * Only support image file currently.
*/
export const uploadFiles = async (
  uris: string[],
  onProgressChange?: (uri: string, event: FileSystem.UploadProgressData) => void,
  onTotalProgressChange?: (event: {
    uri: string
    totalTaskCount: number
    completedTaskCount: number
    currentFileEvent: FileSystem.UploadProgressData
  }) => void,
) => {
  const totalTaskCount = uris.length;
  let completedTaskCount = 0;

  return Promise.all(
    uris.map((uri) => {
      return uploadFile(uri, (event) => {
        const isCompleted = event.totalBytesSent === event.totalBytesExpectedToSend;
        if (isCompleted) {
          completedTaskCount += 1;
          onTotalProgressChange?.({
            uri,
            totalTaskCount,
            completedTaskCount,
            currentFileEvent: event,
          });
        }

        onProgressChange?.(uri, event);
      });
    },
    ));
};
