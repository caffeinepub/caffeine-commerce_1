import { useEffect, useState } from 'react';
import type { backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

/**
 * Admin actor hook that creates an anonymous actor for open admin access.
 * No Internet Identity or authentication required.
 */
export function useAdminActor() {
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const initActor = async () => {
      try {
        // Create an anonymous actor for admin operations (open access)
        // This actor does not use Internet Identity or any stored session
        const newActor = await createActorWithConfig();
        setActor(newActor);
      } catch (error) {
        console.error('Failed to initialize admin actor:', error);
        // Set actor to null but mark as not fetching so UI can show error state
        setActor(null);
      } finally {
        setIsFetching(false);
      }
    };

    initActor();
  }, []);

  return { actor, isFetching };
}
