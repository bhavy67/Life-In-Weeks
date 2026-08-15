import { useState } from 'react';

export function useStorage<T>(
  key: string,
  initial: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setAndStore = (val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  return [value, setAndStore];
}
