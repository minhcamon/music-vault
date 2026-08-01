import { useEffect, type RefObject } from 'react';

/**
 * Triggers `handler` when a click/pointerdown event is detected
 * outside the element referenced by `ref`.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (e: PointerEvent) => {
      const el = ref.current;
      if (!el || el.contains(e.target as Node)) return;
      handler();
    };

    // Use pointerdown so it fires before focus/click ripple effects
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, handler, enabled]);
}
