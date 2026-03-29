import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { deactivateUser } from '@/lib/graphql/mutations';
import type { UserDto } from '@/types/user';
import { toast } from 'sonner';

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? '';

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(token, userId),
    onSuccess: (data) => {
      // Update the query cache directly with the deactivated user
      queryClient.setQueryData(['users'], (old: { users: UserDto[] } | undefined) => {
        if (!old?.users) return old;
        return {
          users: old.users.map((user) =>
            user.id === data.deactivateUser.id ? data.deactivateUser : user
          ),
        };
      });
      toast.success('User deactivated successfully');
    },
    onError: () => {
      toast.error('Failed to deactivate user');
    },
  });
}
