import {Dimensions, Platform} from 'react-native';

const windowDimensions = Dimensions.get('window');
export const DEVICE_HEIGHT = windowDimensions.height;
export const DEVICE_WIDTH = windowDimensions.width;

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
