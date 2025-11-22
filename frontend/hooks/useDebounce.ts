import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 *
 * Delay việc update giá trị cho đến khi user ngừng typing
 *
 * @param value - Giá trị cần debounce (thường là search input)
 * @param delay - Thời gian delay (ms), default 500ms
 * @returns Giá trị đã được debounce
 *
 * @example
 * const [searchText, setSearchText] = useState('');
 * const debouncedSearch = useDebounce(searchText, 500);
 *
 * useEffect(() => {
 *   // API chỉ gọi sau khi user ngừng typing 500ms
 *   fetchSearchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout để update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear timeout nếu value thay đổi trước khi delay hết
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook
 *
 * Giới hạn số lần function được gọi trong 1 khoảng thời gian
 *
 * @param value - Giá trị cần throttle
 * @param interval - Thời gian giữa các lần update (ms), default 300ms
 * @returns Giá trị đã được throttle
 *
 * @example
 * const throttledScroll = useThrottle(scrollPosition, 300);
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastExecuted, setLastExecuted] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecuted = now - lastExecuted;

    if (timeSinceLastExecuted >= interval) {
      setThrottledValue(value);
      setLastExecuted(now);
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastExecuted(Date.now());
      }, interval - timeSinceLastExecuted);

      return () => clearTimeout(timer);
    }
  }, [value, interval, lastExecuted]);

  return throttledValue;
}
