import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Button, Input } from '../components/ui';
import { EventCard } from '../components/domain/EventCard';
import { useMyEvents } from '../hooks/useEvents';
import { eventsService } from '../services/events.service';
import { blockchainService } from '../services/blockchain.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import { Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function MyEventsPage() {
  const { isOrganizer } = useAuth();
  const { events, loading, refetch } = useMyEvents();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  if (!isOrganizer) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 text-lg">
          You need organizer access to manage events.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Contact an admin to have your account upgraded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">My Events</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Event'}
        </Button>
      </div>

      {showForm && (
        <CreateEventForm
          onCreated={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}

      {loading ? (
        <Spinner className="py-20" />
      ) : events.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          You haven&apos;t created any events yet.
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

function CreateEventForm({ onCreated }: { onCreated: () => void }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    ticketSupply: '',
    priceEth: '',
    maxResalePercent: '150',
    maxTicketsPerWallet: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const maxResaleBps = Math.round(parseFloat(form.maxResalePercent) * 100);
      const maxPerWallet = Number(form.maxTicketsPerWallet) || 0;
      const event = await eventsService.create({
        title: form.name,
        description: form.description || undefined,
        eventDate: new Date(form.date).toISOString(),
        venue: form.venue || undefined,
        totalTickets: Number(form.ticketSupply),
        basePriceEth: form.priceEth,
        maxResaleMultiplierBps: maxResaleBps,
        maxTicketsPerWallet: maxPerWallet,
      });

      const priceWei = ethers.parseEther(form.priceEth);
      const txResult = await blockchainService.createEvent(
        form.name,
        Number(form.ticketSupply),
        priceWei,
        maxResaleBps,
        maxPerWallet,
      );

      await eventsService.publish(
        event.id,
        txResult.txHash,
        txResult.onChainEventId,
      );
      notify.success('Event created and published!');
      onCreated();
      navigate(`/events/${event.id}`);
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to create event'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-lg p-6 mb-8 space-y-4"
    >
      <Input
        label="Event Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={handleChange}
          required
        />
        <Input
          label="Venue"
          name="venue"
          value={form.venue}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Ticket Supply"
          name="ticketSupply"
          type="number"
          min="1"
          value={form.ticketSupply}
          onChange={handleChange}
          required
        />
        <Input
          label="Price (ETH)"
          name="priceEth"
          type="number"
          step="0.0001"
          min="0"
          value={form.priceEth}
          onChange={handleChange}
          required
        />
        <Input
          label="Max Resale (%)"
          name="maxResalePercent"
          type="number"
          min="100"
          value={form.maxResalePercent}
          onChange={handleChange}
          required
        />
      </div>
      <Input
        label="Max Tickets Per Wallet (0 = unlimited)"
        name="maxTicketsPerWallet"
        type="number"
        min="0"
        value={form.maxTicketsPerWallet}
        onChange={handleChange}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          Create &amp; Publish
        </Button>
      </div>
    </form>
  );
}
