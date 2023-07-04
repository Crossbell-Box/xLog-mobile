import { useCurrentRoute } from "../use-current-route";

export const useGAWithScreenParams = () => {
  const currentRoute = useCurrentRoute();
  return {
    screen_class: currentRoute?.name,
    screen_name: currentRoute?.name,
  };
};
