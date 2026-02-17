import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { SiteSettings } from '../../backend';

export function useGetSiteSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SiteSettings>({
    queryKey: queryKeys.siteSettings,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteSettings();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useUpdateSiteSettings() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateSiteSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteSettings });
    },
  });
}
