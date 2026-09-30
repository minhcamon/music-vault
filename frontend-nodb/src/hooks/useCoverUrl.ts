import { useState, useEffect } from 'react';
import { db } from '../db/database';

/**
 * Custom hook to safely fetch, convert, and manage object URL lifecycle for cover art
 * Automatically revokes previous object URLs on unmount or coverId change to prevent memory leaks.
 */
export function useCoverUrl(coverId?: string, fallbackUrl?: string): string | undefined {
  const [objectUrl, setObjectUrl] = useState<string | undefined>(fallbackUrl);

  useEffect(() => {
    let isMounted = true;
    let activeUrl: string | undefined = undefined;

    if (!coverId) {
      setObjectUrl(fallbackUrl);
      return;
    }

    db.covers
      .get(coverId)
      .then((record) => {
        if (!isMounted) return;
        if (record && record.blob) {
          activeUrl = URL.createObjectURL(record.blob);
          setObjectUrl(activeUrl);
        } else {
          setObjectUrl(fallbackUrl);
        }
      })
      .catch((err) => {
        console.warn(`[useCoverUrl] Error fetching cover for ID ${coverId}:`, err);
        if (isMounted) {
          setObjectUrl(fallbackUrl);
        }
      });

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [coverId, fallbackUrl]);

  return objectUrl;
}
