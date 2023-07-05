import { useEffect } from "react";

import { GA } from "@/utils/GA";

interface Event {
  page_name: string
  params?: Record<string, unknown>
}

interface Time {
  milliseconds: number
  formatted: string
}

const useGAWithPageStayTime = (event: Event) => {
  const startTime = Date.now();

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = (minutes % 60).toString().padStart(2, "0");
    const formattedSeconds = (seconds % 60).toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    return () => {
      const stayTime = Date.now() - startTime;
      const { page_name, params } = event;
      const formattedTime = formatTime(stayTime);
      GA.logEvent("page_stay_time", {
        ...params || {},
        screen_name: page_name,
        stay_time: stayTime,
        stay_time_formatted: formattedTime,
      });
    };
  }, [event, startTime]);
};

export default useGAWithPageStayTime;
