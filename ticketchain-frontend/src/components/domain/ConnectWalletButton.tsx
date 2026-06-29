import { Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../hooks/useAuth';
import { truncateAddress } from '../../utils/format';

export function ConnectWalletButton() {
  const { address, isConnecting, isConnected, connect } = useWallet();
  const { isAuthenticated, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const success = await login();
    if (success) navigate('/events');
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button size="sm" loading={isConnecting} onClick={connect}>
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button size="sm" onClick={handleSignIn}>
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        className="text-sm font-mono text-gray-600 hover:text-black transition-colors"
      >
        {truncateAddress(address!)}
      </Link>
      <Button variant="outline" size="sm" onClick={logout}>
        Sign Out
      </Button>
    </div>
  );
}
