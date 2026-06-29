import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '../services/events.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import type { Event } from '../types/event.types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsService.getAll();
      setEvents(data);
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
}

export function useEvent(id: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(() => {
    if (!id) return;
    setLoading(true);
    eventsService
      .getById(id)
      .then(setEvent)
      .catch((error) =>
        notify.error(getErrorMessage(error, 'Failed to load event')),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, refetch: fetchEvent };
}

export function useMyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventsService.getMyEvents();
      setEvents(data);
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to load your events'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  return { events, loading, refetch: fetchMyEvents };
}
