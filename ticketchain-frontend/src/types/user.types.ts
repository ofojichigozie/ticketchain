export interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  email: string | null;
  role: 'attendee' | 'organizer' | 'admin';
  avatarUrl: string | null;
  createdAt: string;
}
