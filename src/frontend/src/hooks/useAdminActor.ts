import { useEffect, useState } from 'react';
import type { backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

export function useAdminActor() {
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const initActor = async () => {
      try {
        // Create an anonymous actor for admin operations (open access during development)
        const newActor = await createActorWithConfig();
        setActor(newActor);
      } catch (error) {
        console.error('Failed to initialize admin actor:', error);
      } finally {
        setIsFetching(false);
      }
    };

    initActor();
  }, []);

  return { actor, isFetching };
}
