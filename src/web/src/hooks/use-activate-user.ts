import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { activateUser } from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export function useActivateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? '';

  return useMutation({
    mutationFn: (userId: string) => activateUser(token, userId),
    onSuccess: () => {
      // Invalidate all user queries so they refetch with fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User activated successfully');
    },
    onError: () => {
      toast.error('Failed to activate user');
    },
  });
}