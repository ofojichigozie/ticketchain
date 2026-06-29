import { useState, useEffect, useCallback } from 'react';
import { ticketsService } from '../services/tickets.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import type { Ticket, TicketWithHistory } from '../types/ticket.types';

export function useMyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ticketsService.getMyTickets();
      setTickets(data);
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to load your tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, refetch: fetchTickets };
}

export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<TicketWithHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ticketsService
      .getById(id)
      .then(setTicket)
      .catch((error) =>
        notify.error(getErrorMessage(error, 'Failed to load ticket')),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return { ticket, loading };
}
