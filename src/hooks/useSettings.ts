import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/data/api';
import { Settings } from '@/data/types';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<Settings>) => updateSettings(newSettings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
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
