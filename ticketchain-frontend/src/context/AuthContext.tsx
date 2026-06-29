import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import {
  usersService,
  type UpdateProfilePayload,
} from '../services/users.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import type { User } from '../types/user.types';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isOrganizer: false,
  isAdmin: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, disconnect } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (): Promise<boolean> => {
    if (!address) {
      notify.error('Connect your wallet first');
      return false;
    }

    try {
      const { nonce } = await authService.getNonce(address);
      const message = `Sign this message to authenticate with TicketChain.\n\nNonce: ${nonce}`;

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      const { accessToken, user: userData } = await authService.verify(
        address,
        signature,
      );

      console.log({ userData });

      localStorage.setItem('token', accessToken);
      setUser(userData);
      notify.success('Signed in successfully');
      return true;
    } catch (error) {
      notify.error(getErrorMessage(error, 'Authentication failed'));
      return false;
    }
  }, [address]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then((userData) => setUser(userData))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    if (
      !address ||
      address.toLowerCase() !== user.walletAddress.toLowerCase()
    ) {
      logout();
    }
  }, [address, user, logout]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await usersService.updateProfile(payload);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
