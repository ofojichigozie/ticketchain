import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Calendar, MapPin } from 'lucide-react';
import { Badge, Button } from '../ui';
import { formatEth, formatDate, truncateAddress } from '../../utils/format';
import { blockchainService } from '../../services/blockchain.service';
import { marketplaceService } from '../../services/marketplace.service';
import { notify } from '../../utils/notifications';
import { getErrorMessage } from '../../utils/errors';
import type { Listing } from '../../types/listing.types';

interface ListingCardProps {
  listing: Listing;
  currentAddress?: string | null;
  isAuthenticated?: boolean;
  onPurchased?: () => void;
}

export function ListingCard({
  listing,
  currentAddress,
  isAuthenticated,
  onPurchased,
}: ListingCardProps) {
  const [buying, setBuying] = useState(false);
  const isSeller =
    currentAddress?.toLowerCase() === listing.sellerAddress?.toLowerCase();

  const handleBuy = async () => {
    setBuying(true);
    try {
      const priceWei = ethers.parseEther(listing.askingPriceEth);
      const receipt = await blockchainService.resaleTransfer(
        currentAddress!,
        listing.tokenId!,
        priceWei,
      );
      await marketplaceService.confirmResalePurchase(listing.id, receipt.hash);
      notify.success('Ticket purchased from marketplace!');
      onPurchased?.();
    } catch (error) {
      notify.error(getErrorMessage(error, 'Purchase failed'));
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white flex flex-col gap-3">
      {/* Event info */}
      <div>
        {listing.eventTitle ? (
          listing.eventId ? (
            <Link
              to={`/events/${listing.eventId}`}
              className="font-semibold text-black hover:underline line-clamp-1"
            >
              {listing.eventTitle}
            </Link>
          ) : (
            <p className="font-semibold text-black line-clamp-1">
              {listing.eventTitle}
            </p>
          )
        ) : (
          <p className="text-sm text-gray-400 italic">Unknown event</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {listing.eventDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDate(listing.eventDate)}
            </span>
          )}
          {listing.eventVenue && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {listing.eventVenue}
            </span>
          )}
        </div>
      </div>

      {/* Ticket meta */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-mono">
          Token #{listing.tokenId ?? '—'}
        </p>
        <p className="text-xs text-gray-400">
          Seller: {truncateAddress(listing.sellerAddress ?? '')}
        </p>
      </div>

      {/* Price + action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-lg font-bold text-black">
          {formatEth(listing.askingPriceEth)} ETH
        </span>
        {listing.status === 'active' && !isSeller && isAuthenticated && (
          <Button size="sm" loading={buying} onClick={handleBuy}>
            Buy Now
          </Button>
        )}
        {listing.status === 'active' && !isSeller && !isAuthenticated && (
          <span className="text-xs text-gray-400">Sign in to buy</span>
        )}
        {isSeller && (
          <span className="text-xs text-gray-400">Your listing</span>
        )}
      </div>
    </div>
  );
}
