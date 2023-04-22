import ExpoModulesCore

public class NativeUtils: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeUtils")

    AsyncFunction("isAppInstalled") { (arguments: [Any?], promise: Promise) in
      guard let packageName = arguments[0] as? String else {
        promise.reject(
          NSError(domain: "INVALID_PACKAGE_NAME",
                  code: 1001,
                  userInfo: [NSLocalizedDescriptionKey: "Invalid package name"])
        )
        return
      }
      
      let isInstalled: Bool
      let url = URL(string: packageName)

      if let url = url, UIApplication.shared.canOpenURL(url) {
        isInstalled = true
      } else {
        isInstalled = false
      }
      promise.resolve(isInstalled)
    }
  }
}
