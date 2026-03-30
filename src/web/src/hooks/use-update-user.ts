import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/lib/graphql/mutations';
import type { UpdateUserInput } from '@/types/user';
import { toast } from 'sonner';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? '';

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      updateUser(token, userId, input),
    onSuccess: () => {
      // Invalidate all user queries to force refetch from server
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });
}
