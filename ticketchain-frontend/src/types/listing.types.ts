export interface Listing {
  id: string;
  ticketId: string;
  tokenId: number | null;
  sellerId: string;
  sellerAddress: string | null;
  askingPriceEth: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  eventId: string | null;
  eventTitle: string | null;
  eventDate: string | null;
  eventVenue: string | null;
}
