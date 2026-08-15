import { useState, useCallback, useRef } from 'react';

interface ToastState {
  message: string;
  key: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, showToast };
}
