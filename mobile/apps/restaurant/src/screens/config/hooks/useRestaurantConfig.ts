/**
 * useRestaurantConfig Hook
 *
 * Central data hook for the Config Hub.
 * - TanStack Query for GET /config/:restaurantId (5min stale time)
 * - Mutations for each PATCH domain endpoint with optimistic updates
 * - WebSocket subscription to `config:updated` via /service-config namespace
 * - On remote update: invalidate query cache for affected domain, show toast
 *
 * @module config/hooks/useRestaurantConfig
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import ApiService from '@/shared/services/api';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { t } from '@/shared/i18n';
import type {
  RestaurantConfig,
  SetupCompletion,
  ConfigProfile,
  ServiceTypeConfig,
  ExperienceFlags,
  FloorLayout,
  KitchenStationsConfig,
  PaymentConfig,
  EnabledFeatures,
  TeamConfig,
  ConfigDomain,
} from '../types/config.types';

// ============================================
// QUERY KEYS
// ============================================

export const configQueryKeys = {
  all: (restaurantId: string) => ['config', restaurantId] as const,
  completion: (restaurantId: string) => ['config', restaurantId, 'completion'] as const,
};

// ============================================
// API FUNCTIONS
// ============================================

const configApi = {
  getConfig: async (restaurantId: string): Promise<RestaurantConfig> => {
    const response = await ApiService.get(`/config/${restaurantId}`);
    return response.data;
  },

  getCompletion: async (restaurantId: string): Promise<SetupCompletion> => {
    const response = await ApiService.get(`/config/${restaurantId}/completion`);
    return response.data;
  },

  updateProfile: async (restaurantId: string, data: Partial<ConfigProfile>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/profile`, data);
    return response.data;
  },

  updateServiceTypes: async (restaurantId: string, data: Partial<ServiceTypeConfig>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/service-types`, data);
    return response.data;
  },

  updateExperience: async (restaurantId: string, data: Partial<ExperienceFlags>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/experience`, data);
    return response.data;
  },

  updateFloor: async (restaurantId: string, data: Partial<FloorLayout>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/floor`, data);
    return response.data;
  },

  updateKitchen: async (restaurantId: string, data: Partial<KitchenStationsConfig>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/kitchen`, data);
    return response.data;
  },

  updatePayments: async (restaurantId: string, data: Partial<PaymentConfig>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/payments`, data);
    return response.data;
  },

  updateFeatures: async (restaurantId: string, data: Partial<EnabledFeatures>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/features`, data);
    return response.data;
  },

  updateTeam: async (restaurantId: string, data: Partial<TeamConfig>): Promise<RestaurantConfig> => {
    const response = await ApiService.patch(`/config/${restaurantId}/team`, data);
    return response.data;
  },
};

// ============================================
// HOOK
// ============================================

export function useRestaurantConfig(restaurantId: string) {
  const queryClient = useQueryClient();
  const toastShownRef = useRef(false);

  // ---- Main config query (5min stale time) ----
  const {
    data: config,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: configQueryKeys.all(restaurantId),
    queryFn: () => configApi.getConfig(restaurantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!restaurantId,
  });

  // ---- Completion query ----
  const {
    data: completion,
    isLoading: isCompletionLoading,
  } = useQuery({
    queryKey: configQueryKeys.completion(restaurantId),
    queryFn: () => configApi.getCompletion(restaurantId),
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantId,
  });

  // ---- WebSocket subscription ----
  const { on, off, connected } = useWebSocket('/service-config');

  useEffect(() => {
    if (!connected) return;

    const handleConfigUpdated = (data: { domain?: ConfigDomain; restaurantId?: string }) => {
      // Only process events for this restaurant
      if (data.restaurantId && data.restaurantId !== restaurantId) return;

      // Invalidate both config and completion queries
      queryClient.invalidateQueries({
        queryKey: configQueryKeys.all(restaurantId),
      });
      queryClient.invalidateQueries({
        queryKey: configQueryKeys.completion(restaurantId),
      });

      // Show toast notification (debounced)
      if (!toastShownRef.current) {
        toastShownRef.current = true;
        Alert.alert(
          t('config.hub.title'),
          t('config.remoteUpdate'),
        );
        setTimeout(() => {
          toastShownRef.current = false;
        }, 3000);
      }
    };

    on('config:updated', handleConfigUpdated);

    return () => {
      off('config:updated', handleConfigUpdated);
    };
  }, [connected, restaurantId, on, off, queryClient]);

  // ---- Helper: create optimistic mutation ----
  const createConfigMutation = <TData>(
    mutationFn: (data: TData) => Promise<RestaurantConfig>,
    domainField?: keyof RestaurantConfig,
  ) => {
    return useMutation({
      mutationFn,
      onMutate: async (newData: TData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: configQueryKeys.all(restaurantId),
        });

        // Snapshot previous value
        const previousConfig = queryClient.getQueryData<RestaurantConfig>(
          configQueryKeys.all(restaurantId),
        );

        // Optimistic update
        if (previousConfig && domainField) {
          queryClient.setQueryData(
            configQueryKeys.all(restaurantId),
            {
              ...previousConfig,
              [domainField]: {
                ...(previousConfig[domainField] as object),
                ...(newData as object),
              },
            },
          );
        }

        return { previousConfig };
      },
      onError: (_err, _newData, context) => {
        // Revert on error
        if (context?.previousConfig) {
          queryClient.setQueryData(
            configQueryKeys.all(restaurantId),
            context.previousConfig,
          );
        }
      },
      onSettled: () => {
        // Refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: configQueryKeys.all(restaurantId),
        });
        queryClient.invalidateQueries({
          queryKey: configQueryKeys.completion(restaurantId),
        });
      },
    });
  };

  // ---- Mutations ----
  const updateProfileMutation = createConfigMutation<Partial<ConfigProfile>>(
    (data) => configApi.updateProfile(restaurantId, data),
    'profile',
  );

  const updateServiceTypesMutation = createConfigMutation<Partial<ServiceTypeConfig>>(
    (data) => configApi.updateServiceTypes(restaurantId, data),
    'service_types',
  );

  const updateExperienceMutation = createConfigMutation<Partial<ExperienceFlags>>(
    (data) => configApi.updateExperience(restaurantId, data),
    'experience_flags',
  );

  const updateFloorMutation = createConfigMutation<Partial<FloorLayout>>(
    (data) => configApi.updateFloor(restaurantId, data),
    'floor_layout',
  );

  const updateKitchenMutation = createConfigMutation<Partial<KitchenStationsConfig>>(
    (data) => configApi.updateKitchen(restaurantId, data),
    'kitchen_stations',
  );

  const updatePaymentsMutation = createConfigMutation<Partial<PaymentConfig>>(
    (data) => configApi.updatePayments(restaurantId, data),
    'payment_config',
  );

  const updateFeaturesMutation = createConfigMutation<Partial<EnabledFeatures>>(
    (data) => configApi.updateFeatures(restaurantId, data),
    'enabled_features',
  );

  const updateTeamMutation = createConfigMutation<Partial<TeamConfig>>(
    (data) => configApi.updateTeam(restaurantId, data),
    'team_config',
  );

  // ---- Convenience wrappers ----
  const updateProfile = useCallback(
    (data: Partial<ConfigProfile>) => updateProfileMutation.mutateAsync(data),
    [updateProfileMutation],
  );

  const updateServiceTypes = useCallback(
    (data: Partial<ServiceTypeConfig>) => updateServiceTypesMutation.mutateAsync(data),
    [updateServiceTypesMutation],
  );

  const updateExperience = useCallback(
    (data: Partial<ExperienceFlags>) => updateExperienceMutation.mutateAsync(data),
    [updateExperienceMutation],
  );

  const updateFloor = useCallback(
    (data: Partial<FloorLayout>) => updateFloorMutation.mutateAsync(data),
    [updateFloorMutation],
  );

  const updateKitchen = useCallback(
    (data: Partial<KitchenStationsConfig>) => updateKitchenMutation.mutateAsync(data),
    [updateKitchenMutation],
  );

  const updatePayments = useCallback(
    (data: Partial<PaymentConfig>) => updatePaymentsMutation.mutateAsync(data),
    [updatePaymentsMutation],
  );

  const updateFeatures = useCallback(
    (data: Partial<EnabledFeatures>) => updateFeaturesMutation.mutateAsync(data),
    [updateFeaturesMutation],
  );

  const updateTeam = useCallback(
    (data: Partial<TeamConfig>) => updateTeamMutation.mutateAsync(data),
    [updateTeamMutation],
  );

  // ---- Saving state aggregation ----
  const isSaving =
    updateProfileMutation.isPending ||
    updateServiceTypesMutation.isPending ||
    updateExperienceMutation.isPending ||
    updateFloorMutation.isPending ||
    updateKitchenMutation.isPending ||
    updatePaymentsMutation.isPending ||
    updateFeaturesMutation.isPending ||
    updateTeamMutation.isPending;

  return {
    // Data
    config: config ?? null,
    completion: completion ?? null,
    isLoading,
    isCompletionLoading,
    isError,
    error,
    isSaving,

    // Refetch
    refetch,

    // Mutation functions
    updateProfile,
    updateServiceTypes,
    updateExperience,
    updateFloor,
    updateKitchen,
    updatePayments,
    updateFeatures,
    updateTeam,

    // Raw mutation objects (for accessing isPending, isError, etc.)
    mutations: {
      profile: updateProfileMutation,
      serviceTypes: updateServiceTypesMutation,
      experience: updateExperienceMutation,
      floor: updateFloorMutation,
      kitchen: updateKitchenMutation,
      payments: updatePaymentsMutation,
      features: updateFeaturesMutation,
      team: updateTeamMutation,
    },
  };
}
