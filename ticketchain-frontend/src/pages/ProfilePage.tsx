import { useState, useEffect } from 'react';
import { Input, Button } from '../components/ui';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { truncateAddress } from '../utils/format';

export function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const { saving, saveProfile } = useUsers();

  const [form, setForm] = useState({
    username: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? '',
        email: user.email ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Sign in to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({
      username: form.username || undefined,
      email: form.email || undefined,
      avatarUrl: form.avatarUrl || undefined,
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Profile</h1>

      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="h-14 w-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold border border-gray-200">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-black">
              {user?.username ?? (
                <span className="text-gray-400 italic">No username</span>
              )}
            </p>
            <p className="text-xs font-mono text-gray-400">
              {user && truncateAddress(user.walletAddress)}
            </p>
            <span className="inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="yourname"
          maxLength={50}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        <Input
          label="Avatar URL"
          name="avatarUrl"
          type="url"
          value={form.avatarUrl}
          onChange={handleChange}
          placeholder="https://..."
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
