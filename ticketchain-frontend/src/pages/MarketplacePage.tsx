import { ListingCard } from '../components/domain/ListingCard';
import { Spinner } from '../components/ui';
import { useListings } from '../hooks/useMarketplace';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';

export function MarketplacePage() {
  const { listings, loading, refetch } = useListings();
  const { address } = useWallet();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Marketplace</h1>

      {loading ? (
        <Spinner className="py-20" />
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          No listings available yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentAddress={address}
              isAuthenticated={isAuthenticated}
              onPurchased={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
