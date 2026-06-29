import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '../ui';
import { formatEth, formatDate } from '../../utils/format';
import type { Ticket } from '../../types/ticket.types';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block border border-gray-200 rounded-lg p-5 hover:border-black transition-colors bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="font-semibold text-black leading-tight line-clamp-1">
            {ticket.eventTitle ?? 'Unknown Event'}
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Token #{ticket.tokenId}
          </p>
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

      <div className="space-y-1 mb-3">
        {ticket.eventDate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatDate(ticket.eventDate)}</span>
          </div>
        )}
        {ticket.eventVenue && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{ticket.eventVenue}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-500">Original price</span>
        <span className="font-medium text-black">
          {formatEth(ticket.purchasePriceEth ?? '0')} ETH
        </span>
      </div>
    </Link>
  );
}
