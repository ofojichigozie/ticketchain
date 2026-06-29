import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import { useAuth } from './useAuth';
import type { User } from '../types/user.types';
import type { UpdateProfilePayload } from '../services/users.service';

export function useUsers() {
  const { updateProfile } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = useCallback(
    async (
      user: User,
      role: 'organizer' | 'admin' | 'attendee',
    ): Promise<void> => {
      const updated = await usersService.updateRole(user.id, role);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? { ...u, role: updated.role as User['role'] }
            : u,
        ),
      );
    },
    [],
  );

  const saveProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<boolean> => {
      setSaving(true);
      try {
        await updateProfile(payload);
        notify.success('Profile updated');
        return true;
      } catch (error) {
        notify.error(getErrorMessage(error, 'Failed to update profile'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [updateProfile],
  );

  return { users, loading, updateRole, saving, saveProfile };
}
