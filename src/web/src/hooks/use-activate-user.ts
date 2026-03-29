import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { activateUser } from '@/lib/graphql/mutations';
import type { UserDto } from '@/types/user';
import { toast } from 'sonner';

export function useActivateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? '';

  return useMutation({
    mutationFn: (userId: string) => activateUser(token, userId),
    onSuccess: (data) => {
      // Update the query cache directly with the activated user
      queryClient.setQueryData(['users'], (old: { users: UserDto[] } | undefined) => {
        if (!old?.users) return old;
        return {
          users: old.users.map((user) =>
            user.id === data.activateUser.id ? data.activateUser : user
          ),
        };
      });
      toast.success('User activated successfully');
    },
    onError: () => {
      toast.error('Failed to activate user');
    },
  });
}