import { Linking, Platform } from 'react-native';
import { isAppInstalled as _isAppInstalled } from 'native-utils';

const isAndroid = Platform.OS === 'android';

interface InstalledAppInterface {
  /**
   * Checks if an app is installed on the device by receiving the applicationId for Android (e.g. com.walletconnect.example)
   * or App Scheme for iOS (e.g. wc://)
   *
   * NOTE: As of iOS 9, your app needs to provide the LSApplicationQueriesSchemes key inside Info.plist.
   *
   * @param id - String representing the appId or scheme
   */
  isAppInstalled(id?: string | null): Promise<boolean>;
}

async function isAppInstalled(id?: string | null): Promise<boolean> {
  if (!id) {
    return Promise.resolve(false);
  }

  if (isAndroid) {
    return await _isAppInstalled(id);
  } else {
    try {
      return await Linking.canOpenURL(id);
    } catch {
      return false;
    }
  }
}

export default { isAppInstalled } as InstalledAppInterface;
