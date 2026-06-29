export interface Event {
  id: string;
  onChainEventId: number | null;
  organizerId: string;
  organizerAddress: string | null;
  title: string;
  description: string | null;
  venue: string | null;
  eventDate: string;
  bannerUrl: string | null;
  totalTickets: number;
  ticketsSold: number;
  basePriceEth: string;
  maxResaleMultiplierBps: number | null;
  maxTicketsPerWallet: number;
  contractAddress: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
}
