import { TicketCard } from '../components/domain/TicketCard';
import { Spinner } from '../components/ui';
import { useMyTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';

export function MyTicketsPage() {
  const { isAuthenticated } = useAuth();
  const { tickets, loading } = useMyTickets();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">Sign in to view your tickets.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">My Tickets</h1>

      {loading ? (
        <Spinner className="py-20" />
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          You don&apos;t have any tickets yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
