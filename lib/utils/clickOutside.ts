import { useEffect } from 'react';

import type { RefObject } from 'react';

type EventHandler = (event: MouseEvent) => void;

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: EventHandler,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}
