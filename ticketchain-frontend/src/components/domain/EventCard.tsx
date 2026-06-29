import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { Badge } from '../ui';
import { formatDate, formatEth } from '../../utils/format';
import type { Event } from '../../types/event.types';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const remainingTickets = event.totalTickets - event.ticketsSold;

  return (
    <Link
      to={`/events/${event.id}`}
      className="block border border-gray-200 rounded-lg p-5 hover:border-black transition-colors bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-black text-lg leading-tight">
          {event.title}
        </h3>
        <Badge variant={event.status === 'published' ? 'success' : 'default'}>
          {event.status}
        </Badge>
      </div>

      {event.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.eventDate)}</span>
        </div>
        {event.venue && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          <span>
            {remainingTickets} / {event.totalTickets} remaining
          </span>
        </div>
        {event.maxTicketsPerWallet > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Max {event.maxTicketsPerWallet} per wallet</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-lg font-bold text-black">
          {formatEth(event.basePriceEth)} ETH
        </span>
        {remainingTickets === 0 && <Badge variant="error">Sold Out</Badge>}
      </div>
    </Link>
  );
}
