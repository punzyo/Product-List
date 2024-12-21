import { useRef } from 'react';
export const useDebounce = (callback, delay) => {
  const timerId = useRef(null);

  const debouncedCallback = (...args) => {
    if (timerId.current) clearTimeout(timerId.current);
    timerId.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedCallback;
};
