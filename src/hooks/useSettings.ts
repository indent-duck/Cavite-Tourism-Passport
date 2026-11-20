import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/data/api';
import { Settings } from '@/data/types';

const SETTINGS_KEY = ['settings'];

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<Settings>) => updateSettings(newSettings),
    // Optimistic: flip the toggle immediately, roll back if the save fails
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<Settings>(SETTINGS_KEY);
      if (previous) {
        queryClient.setQueryData<Settings>(SETTINGS_KEY, { ...previous, ...newSettings });
      }
      return { previous };
    },
    onError: (_error, _newSettings, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SETTINGS_KEY, context.previous);
      }
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SETTINGS_KEY, updatedSettings);
    },
  });

  const updateSetting = (key: keyof Settings, value: boolean) => {
    mutation.mutate({ [key]: value });
  };

  return {
    settings,
    isLoading,
    updateSetting,
    isUpdating: mutation.isPending,
  };
}
