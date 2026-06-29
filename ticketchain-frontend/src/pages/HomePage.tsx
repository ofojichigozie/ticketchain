import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Ticket, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui';
import { ConnectWalletButton } from '../components/domain/ConnectWalletButton';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      <section className="text-center py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black tracking-tight mb-4">
          TicketChain
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 px-2">
          Blockchain-powered event ticketing with built-in anti-scalping
          protection. Buy, sell, and verify tickets as NFTs.
        </p>

        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/events">
              <Button size="lg">
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="secondary" size="lg">
                Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ConnectWalletButton />
            <p className="text-xs text-gray-400">
              Connect your wallet and sign in to browse events and the
              marketplace.
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <Ticket className="h-8 w-8 mx-auto mb-3 text-black" />
          <h3 className="font-semibold text-black mb-2">NFT Tickets</h3>
          <p className="text-sm text-gray-500">
            Every ticket is a unique ERC-721 NFT on the blockchain, ensuring
            authenticity and ownership.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <Shield className="h-8 w-8 mx-auto mb-3 text-black" />
          <h3 className="font-semibold text-black mb-2">Anti-Scalping</h3>
          <p className="text-sm text-gray-500">
            Smart contract enforced resale price caps prevent ticket scalping
            and protect buyers.
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-3 text-black" />
          <h3 className="font-semibold text-black mb-2">Fair Resale</h3>
          <p className="text-sm text-gray-500">
            Resell tickets on the built-in marketplace within fair price limits
            set by organizers.
          </p>
        </div>
      </section>
    </div>
  );
}
