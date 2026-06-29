import { useState } from 'react';
import { Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import type { User } from '../types/user.types';

export function UsersPage() {
  const { isAdmin } = useAuth();
  const { users, loading, updateRole } = useUsers();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Access denied.</p>
      </div>
    );
  }

  const handleUpdateRole = async (
    user: User,
    role: 'organizer' | 'attendee',
  ) => {
    setUpdatingId(user.id);
    try {
      await updateRole(user, role);
      const label = user.username ?? user.walletAddress.slice(0, 8);
      notify.success(
        role === 'organizer'
          ? `${label} promoted to organizer`
          : `${label} demoted to attendee`,
      );
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to update role'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Users</h1>

      {loading ? (
        <Spinner className="py-20" />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Wallet
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Username
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Role
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {user.walletAddress.slice(0, 6)}…
                    {user.walletAddress.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.username ?? (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RoleAction
                      user={user}
                      updatingId={updatingId}
                      onUpdate={handleUpdateRole}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: User['role'] }) {
  const styles: Record<User['role'], string> = {
    admin: 'bg-black text-white',
    organizer: 'bg-gray-800 text-white',
    attendee: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function RoleAction({
  user,
  updatingId,
  onUpdate,
}: {
  user: User;
  updatingId: string | null;
  onUpdate: (user: User, role: 'organizer' | 'attendee') => void;
}) {
  const busy = updatingId === user.id;
  if (user.role === 'attendee') {
    return (
      <button
        onClick={() => onUpdate(user, 'organizer')}
        disabled={busy}
        className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300
          hover:bg-black hover:text-white hover:border-black transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? 'Updating…' : 'Make Organizer'}
      </button>
    );
  }
  if (user.role === 'organizer') {
    return (
      <button
        onClick={() => onUpdate(user, 'attendee')}
        disabled={busy}
        className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300
          hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? 'Updating…' : 'Demote'}
      </button>
    );
  }
  return null;
}
