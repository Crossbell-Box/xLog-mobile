package expo.modules.nativeutils

import android.content.pm.PackageManager
import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeUtils : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeUtils")

    AsyncFunction("isAppInstalled") { packageName: String ->
      val packageManager = context.packageManager
      val isInstalled: Boolean = try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          packageManager.getPackageInfo(packageName, PackageManager.MATCH_ALL)
        } else {
          packageManager.getPackageInfo(packageName, 0)
        }
        true
      } catch (e: PackageManager.NameNotFoundException) {
        false
      }
      isInstalled
    }
  }
}
