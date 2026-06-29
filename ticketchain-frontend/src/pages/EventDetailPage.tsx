import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Calendar,
  MapPin,
  Ticket,
  Users,
  Shield,
  TicketCheck,
} from 'lucide-react';
import { Button, Badge, Spinner } from '../components/ui';
import { useEvent } from '../hooks/useEvents';
import { useMyTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { blockchainService } from '../services/blockchain.service';
import { ticketsService } from '../services/tickets.service';
import { eventsService } from '../services/events.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import {
  formatDate,
  formatEth,
  calculateMaxResalePrice,
} from '../utils/format';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { event, loading, refetch } = useEvent(id);
  const { isAuthenticated, isOrganizer } = useAuth();
  const { tickets: myTickets, refetch: refetchTickets } = useMyTickets();
  const [purchasing, setPurchasing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!event) return;
    setPublishing(true);
    try {
      const priceWei = ethers.parseEther(event.basePriceEth);
      const txResult = await blockchainService.createEvent(
        event.title,
        event.totalTickets,
        priceWei,
        event.maxResaleMultiplierBps ?? 10000,
        event.maxTicketsPerWallet ?? 0,
      );
      await eventsService.publish(
        event.id,
        txResult.txHash,
        txResult.onChainEventId,
      );
      notify.success('Event published!');
      refetch();
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to publish event'));
    } finally {
      setPublishing(false);
    }
  };

  const handlePurchase = async () => {
    if (!event || event.onChainEventId == null) return;
    setPurchasing(true);
    try {
      const priceWei = ethers.parseEther(event.basePriceEth);
      const receipt = await blockchainService.purchaseTicket(
        event.onChainEventId,
        priceWei,
      );
      await ticketsService.confirmPurchase(receipt.hash, event.id);
      notify.success('Ticket purchased successfully!');
      refetch();
      refetchTickets();
    } catch (error) {
      notify.error(getErrorMessage(error, 'Purchase failed'));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!event)
    return <p className="text-center text-gray-400 py-20">Event not found.</p>;

  const remaining = event.totalTickets - event.ticketsSold;
  const soldOut = remaining === 0;
  const maxResale = calculateMaxResalePrice(
    event.basePriceEth,
    event.maxResaleMultiplierBps ?? 10000,
  );

  const ownedTickets = isAuthenticated
    ? myTickets.filter((t) => t.eventId === event.id)
    : [];
  const ownedCount = ownedTickets.length;
  const walletLimit = event.maxTicketsPerWallet ?? 0;
  const canBuyMore = walletLimit === 0 || ownedCount < walletLimit;
  const spotsLeft = walletLimit > 0 ? walletLimit - ownedCount : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">
          {event.title}
        </h1>
        <div className="self-start">
          <Badge variant={event.status === 'published' ? 'success' : 'default'}>
            {event.status}
          </Badge>
        </div>
      </div>

      {event.description && (
        <p className="text-gray-500 mb-6">{event.description}</p>
      )}

      <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(event.eventDate)}</span>
        </div>
        {event.venue && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{event.venue}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <Ticket className="h-4 w-4 text-gray-400" />
          <span>
            {remaining} of {event.totalTickets} tickets remaining
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">
            Organizer: {event.organizerAddress || 'N/A'}
          </span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Shield className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
          <span>
            Max resale price: {maxResale} ETH (
            {(event.maxResaleMultiplierBps ?? 10000) / 100}% of original)
          </span>
        </div>
        {event.maxTicketsPerWallet > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 shrink-0 text-gray-400" />
            <span>
              Max {event.maxTicketsPerWallet} ticket
              {event.maxTicketsPerWallet !== 1 ? 's' : ''} per wallet
            </span>
          </div>
        )}
      </div>

      {/* My Tickets for this event */}
      {isAuthenticated && ownedCount > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <TicketCheck className="h-4 w-4 text-gray-400 shrink-0" />
              <p className="text-sm font-medium text-black">
                You own {ownedCount} ticket{ownedCount !== 1 ? 's' : ''} for
                this event
              </p>
            </div>
            {!canBuyMore && walletLimit > 0 && (
              <Badge variant="default">Wallet limit reached</Badge>
            )}
          </div>
          {ownedCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ownedTickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1 hover:border-black hover:text-black transition-colors"
                >
                  <Ticket className="h-3 w-3" />
                  Token #{t.tokenId}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Price per ticket</p>
          <p className="text-2xl font-bold text-black">
            {formatEth(event.basePriceEth)} ETH
          </p>
        </div>
        {event.status === 'published' &&
          isAuthenticated &&
          !soldOut &&
          canBuyMore && (
            <Button size="lg" loading={purchasing} onClick={handlePurchase}>
              Purchase Ticket
            </Button>
          )}
        {event.status === 'published' &&
          isAuthenticated &&
          !soldOut &&
          !canBuyMore && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                Wallet limit reached
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Max {walletLimit} per wallet
              </p>
            </div>
          )}
        {event.status === 'draft' && isOrganizer && (
          <Button size="lg" loading={publishing} onClick={handlePublish}>
            Publish Event
          </Button>
        )}
        {soldOut && <Badge variant="error">Sold Out</Badge>}
        {!isAuthenticated && (
          <p className="text-sm text-gray-400">Connect wallet to purchase</p>
        )}
      </div>
    </div>
  );
}
