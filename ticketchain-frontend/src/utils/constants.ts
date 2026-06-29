const NETWORK_PRESETS: Record<
  string,
  {
    chainId: number;
    rpcUrl: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    blockExplorerUrl?: string;
  }
> = {
  localhost: {
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    chainName: 'Localhost 8545',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  bscTestnet: {
    chainId: 97,
    rpcUrl: 'https://bsc-testnet-dataseed.bnbchain.org',
    chainName: 'BSC Testnet',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    blockExplorerUrl: 'https://testnet.bscscan.com',
  },
};

const NETWORK = import.meta.env.VITE_NETWORK || 'localhost';
export const NETWORK_CONFIG =
  NETWORK_PRESETS[NETWORK] ?? NETWORK_PRESETS.localhost;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const CHAIN_ID = Number(
  import.meta.env.VITE_CHAIN_ID || NETWORK_CONFIG.chainId,
);

export const TICKET_NFT_ADDRESS = import.meta.env.VITE_TICKET_NFT_ADDRESS || '';

export const EVENT_FACTORY_ADDRESS =
  import.meta.env.VITE_EVENT_FACTORY_ADDRESS || '';

export const EVENT_FACTORY_ABI: string[] = [
  'function createEvent(string calldata _name, uint256 _ticketSupply, uint256 _priceWei, uint256 _maxResaleMultiplierBps, uint256 _maxTicketsPerWallet) external returns (uint256 eventId)',
  'function purchaseTicket(uint256 _eventId) external payable returns (uint256 tokenId)',
  'function getEvent(uint256 _eventId) external view returns (tuple(uint256 eventId, address organizer, string name, uint256 ticketSupply, uint256 ticketsMinted, uint256 priceWei, uint256 maxResaleMultiplierBps, bool disabled))',
  'function disableEvent(uint256 _eventId) external',
  'event EventCreated(uint256 indexed eventId, address indexed organizer, string name, uint256 ticketSupply, uint256 priceWei, uint256 maxResaleMultiplierBps)',
];

export const TICKET_NFT_ABI: string[] = [
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function getTicketInfo(uint256 _tokenId) external view returns (tuple(uint256 eventId, uint256 originalPrice, uint256 maxResalePrice, bool isUsed))',
  'function buyResaleTicket(address _to, uint256 _tokenId, uint256 _salePrice) external payable',
  'function markAsUsed(uint256 _tokenId) external',
  'function setApprovalForAll(address operator, bool approved) external',
  'event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 indexed eventId, uint256 originalPrice, uint256 maxResalePrice)',
  'event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 salePrice)',
  'event TicketUsed(uint256 indexed tokenId)',
];
