import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Calendar, MapPin } from 'lucide-react';
import { Badge, Button, Spinner } from '../components/ui';
import { CreateListingModal } from '../components/domain/CreateListingModal';
import { useTicket } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import {
  formatEth,
  formatDate,
  truncateAddress,
  calculateMaxResalePrice,
} from '../utils/format';
import type { Transaction } from '../types/ticket.types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { ticket, loading } = useTicket(id);
  const [showListingModal, setShowListingModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Sign in to view ticket details.</p>
      </div>
    );
  }

  if (loading) return <Spinner className="py-20" />;
  if (!ticket)
    return <p className="text-center text-gray-400 py-20">Ticket not found.</p>;

  const maxResale = calculateMaxResalePrice(
    ticket.purchasePriceEth ?? '0',
    ticket.maxResaleMultiplierBps ?? 15000,
  );

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        @media print {
          body { visibility: hidden; }
          #ticket-print-area {
            visibility: visible;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 2rem;
          }
          #ticket-print-area * { visibility: visible; }
        }
      `}</style>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400 font-mono mb-1">
            Token #{ticket.tokenId}
          </p>
          <h1 className="text-2xl font-bold text-black">
            {ticket.eventTitle ?? 'Ticket Details'}
          </h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {ticket.eventDate && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(ticket.eventDate)}
              </span>
            )}
            {ticket.eventVenue && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {ticket.eventVenue}
              </span>
            )}
          </div>
        </div>
        <Badge
          variant={
            ticket.status === 'owned'
              ? 'success'
              : ticket.status === 'used'
                ? 'warning'
                : 'default'
          }
        >
          {ticket.status}
        </Badge>
      </div>

      <div
        id="ticket-print-area"
        className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-3 mb-6"
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Event</span>
          <span className="font-medium">
            {ticket.eventTitle ? (
              <Link
                to={`/events/${ticket.eventId}`}
                className="hover:underline"
              >
                {ticket.eventTitle}
              </Link>
            ) : (
              ticket.eventId
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Token #</span>
          <span className="font-medium">{ticket.tokenId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Original Price</span>
          <span className="font-medium">
            {formatEth(ticket.purchasePriceEth ?? '0')} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Max Resale Price</span>
          <span className="font-medium">{maxResale} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Owner</span>
          <span className="font-mono text-xs">
            {truncateAddress(ticket.ownerAddress ?? '')}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Ticket
        </Button>
        {ticket.status === 'owned' && (
          <Button onClick={() => setShowListingModal(true)}>
            List for Resale
          </Button>
        )}
      </div>

      {ticket.history && ticket.history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-black mb-4">
            Ownership History
          </h2>
          <div className="space-y-3">
            {ticket.history.map((tx: Transaction, i: number) => (
              <div
                key={i}
                className="border border-gray-100 rounded-md p-4 text-sm"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-black">{tx.type}</span>
                  <span className="text-gray-400">
                    {formatDate(tx.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {truncateAddress(tx.fromAddress ?? '')} →{' '}
                  {truncateAddress(tx.toAddress ?? '')}
                </p>
                {tx.priceEth && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatEth(tx.priceEth)} ETH
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateListingModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
        ticketId={ticket.id}
        maxResalePriceEth={maxResale}
      />
    </div>
  );
}
