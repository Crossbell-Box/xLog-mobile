import * as ImagePicker from "expo-image-picker";

export const usePickImages = () => {
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
      cameraType: ImagePicker.CameraType.back,
    });

    return result?.assets || [];
  };

  return { pickImages };
};
