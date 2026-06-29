import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID, NETWORK_CONFIG } from '../utils/constants';
import { notify } from '../utils/notifications';

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem('token');
  }, []);

  const switchChain = useCallback(async () => {
    if (!window.ethereum) return;
    const chainHex = ethers.toQuantity(CHAIN_ID);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      // 4902 = chain not added to wallet
      if (code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainHex,
              chainName: NETWORK_CONFIG.chainName,
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrl
                ? [NETWORK_CONFIG.blockExplorerUrl]
                : undefined,
            },
          ],
        });
      } else {
        notify.error('Please switch to the correct network');
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      notify.error('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CHAIN_ID) {
        await switchChain();
      }

      setAddress(accounts[0]);
    } catch {
      notify.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [switchChain]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((result: unknown) => {
        const accounts = result as string[];
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      });

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
