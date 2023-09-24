import { setNeedSSR } from "@crossbell/react-account/ssr-config";
import { setupStorage } from "@crossbell/react-account/storage-config";

import { cacheStorageCompat } from "@/utils/cache-storage";

// Make sure to call this function before using any react-account related functions.
setupStorage(cacheStorageCompat);
setNeedSSR(false);
