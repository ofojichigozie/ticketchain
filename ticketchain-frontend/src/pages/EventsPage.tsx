import { EventCard } from '../components/domain/EventCard';
import { Spinner } from '../components/ui';
import { useEvents } from '../hooks/useEvents';

export function EventsPage() {
  const { events, loading } = useEvents();

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Events</h1>

      {loading ? (
        <Spinner className="py-20" />
      ) : events.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          No events available yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
