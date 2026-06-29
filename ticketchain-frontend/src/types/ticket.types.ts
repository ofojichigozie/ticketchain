export interface Ticket {
  id: string;
  tokenId: number;
  eventId: string;
  ownerId: string;
  ownerAddress: string | null;
  purchasePriceEth: string | null;
  maxResaleMultiplierBps: number | null;
  status: 'owned' | 'listed' | 'used';
  createdAt: string;
  updatedAt: string;
  eventTitle: string | null;
  eventDate: string | null;
  eventVenue: string | null;
}

export interface TicketWithHistory extends Ticket {
  history: Transaction[];
}

export interface Transaction {
  id: string;
  ticketId: string;
  fromUserId: string | null;
  fromAddress: string | null;
  toUserId: string;
  toAddress: string | null;
  type: 'purchase' | 'resale' | 'transfer';
  priceEth: string | null;
  txHash: string | null;
  createdAt: string;
}
