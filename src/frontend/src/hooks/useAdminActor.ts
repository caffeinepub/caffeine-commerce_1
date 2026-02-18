import { useEffect, useState } from 'react';
import type { backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

export function useAdminActor() {
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const initActor = async () => {
      try {
        // Create an anonymous actor for admin authentication
        const newActor = await createActorWithConfig();
        
        // Initialize access control with the secret parameter (same as authenticated actor)
        const adminToken = getSecretParameter('caffeineAdminToken') || '';
        await newActor._initializeAccessControlWithSecret(adminToken);
        
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
