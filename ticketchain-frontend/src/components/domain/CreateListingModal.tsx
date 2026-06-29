import { useState } from 'react';
import { Modal, Button, Input } from '../ui';
import { marketplaceService } from '../../services/marketplace.service';
import { notify } from '../../utils/notifications';
import { getErrorMessage } from '../../utils/errors';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  maxResalePriceEth: string;
  onCreated?: () => void;
}

export function CreateListingModal({
  isOpen,
  onClose,
  ticketId,
  maxResalePriceEth,
  onCreated,
}: CreateListingModalProps) {
  const [priceEth, setPriceEth] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseFloat(priceEth) > parseFloat(maxResalePriceEth)) {
      notify.error(
        `Price cannot exceed ${maxResalePriceEth} ETH (anti-scalping cap)`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await marketplaceService.createListing(ticketId, priceEth);
      notify.success('Listing created');
      setPriceEth('');
      onClose();
      onCreated?.();
    } catch (error) {
      notify.error(getErrorMessage(error, 'Failed to create listing'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List Ticket for Resale">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Price (ETH)"
          type="number"
          step="any"
          min="0"
          value={priceEth}
          onChange={(e) => setPriceEth(e.target.value)}
          placeholder="0.05"
          required
        />
        <p className="text-xs text-gray-500">
          Anti-scalping cap:{' '}
          <span className="font-semibold text-black">
            {maxResalePriceEth} ETH
          </span>{' '}
          — listing above this will be rejected.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Listing
          </Button>
        </div>
      </form>
    </Modal>
  );
}
