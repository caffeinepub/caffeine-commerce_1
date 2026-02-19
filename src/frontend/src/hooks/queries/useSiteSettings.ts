import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePublicActor } from '../usePublicActor';
import { useAdminActor } from '../useAdminActor';
import { queryKeys } from './queryClientKeys';
import type { SiteSettings } from '../../backend';

export function useGetSiteSettings() {
  const { actor, isFetching: actorFetching } = usePublicActor();

  return useQuery<SiteSettings>({
    queryKey: queryKeys.siteSettings,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const settings = await actor.getSiteSettings();
      // Normalize to always return BISAULI as shop name
      return {
        shopName: 'BISAULI',
        logo: settings.logo || '',
      };
    },
    enabled: !!actor && !actorFetching,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce flicker
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: 'always', // Always refetch on mount to ensure fresh data
  });
}

export function useUpdateSiteSettings() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error('Actor not available');
      // Always enforce BISAULI as shop name
      await actor.updateSiteSettings({
        shopName: 'BISAULI',
        logo: settings.logo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteSettings });
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Failed to update site settings');
    },
  });
}
