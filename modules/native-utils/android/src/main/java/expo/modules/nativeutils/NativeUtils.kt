package expo.modules.nativeutils

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions

class NativeUtils : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("NativeUtils")

    AsyncFunction("isAppInstalled") { packageName: String ->
      val isInstalled: Boolean = try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          context.packageManager.getPackageInfo(packageName, PackageManager.MATCH_ALL)
        } else {
          context.packageManager.getPackageInfo(packageName, 0)
        }
        true
      } catch (e: PackageManager.NameNotFoundException) {
        false
      }
      isInstalled
    }
  }
}
