import { useToastController } from "@tamagui/toast";

export const useToast = () => {
  const toast = useToastController();

  return {
    success: (message: string) => {
      toast.show(message, {
        burntOptions: {
          preset: "done",
          haptic: "success",
        },
      });
    },
    normal: (message: string) => {
      toast.show(message, {
        burntOptions: {
          preset: "none",
          haptic: "none",
        },
      });
    },
    error: (message: string) => {
      toast.show(message, {
        burntOptions: {
          preset: "error",
          haptic: "error",
        },
      });
    },
    warn: (message: string) => {
      toast.show(message, {
        burntOptions: {
          preset: "none",
          haptic: "warning",
        },
      });
    },
  };
};
