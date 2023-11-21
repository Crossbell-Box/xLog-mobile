import { useState, useEffect } from "react";

/**
 * useDebouncedValue Hook
 *
 * @param value - The value to debounce.
 * @param duration - Duration in milliseconds for the debounce.
 * @returns Debounced value.
 */
export function useDebouncedValue<T>(value: T, duration: number): T {
  // State to keep track of the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified duration
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, duration);

    // Cleanup function to clear the timeout if the value or duration changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, duration]); // Only re-run if value or duration changes

  return debouncedValue;
}
