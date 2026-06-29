import { useState, useEffect, useCallback } from 'react';
import { marketplaceService } from '../services/marketplace.service';
import { notify } from '../utils/notifications';
import { getErrorMessage } from '../utils/errors';
import type { Listing } from '../types/listing.types';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getListings();
      setListings(data);
    } catch (error) {
      notify.error(
        getErrorMessage(error, 'Failed to load marketplace listings'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, refetch: fetchListings };
}
