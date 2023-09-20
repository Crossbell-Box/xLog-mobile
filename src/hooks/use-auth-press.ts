import { useIsLogin } from "./use-is-login";
import { useRootNavigation } from "./use-navigation";

export function useNavigateToLogin() {
  const navigation = useRootNavigation();
  return () => navigation.navigate("Login");
}

export function useAuthPress<T extends Function>(fn: T, cb?: (isConnected) => void) {
  const isLogin = useIsLogin();
  const navigationToLogin = useNavigateToLogin();
  return () => {
    cb?.(isLogin);

    if (isLogin) {
      fn();
    }
    else {
      navigationToLogin();
    }
  };
}
