import NativeUtils from './src/native-utils';

export async function isAppInstalled(packageName: string): Promise<boolean> {
  return await NativeUtils.isAppInstalled(packageName);
}