import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const NETWORK_PRESETS: Record<string, { rpcUrl: string; chainId: number }> = {
  localhost: {
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
  },
  bscTestnet: {
    rpcUrl: 'https://bsc-testnet-dataseed.bnbchain.org',
    chainId: 97,
  },
};

const EVENT_FACTORY_ABI = [
  'function getEvent(uint256 _eventId) view returns (tuple(uint256 eventId, address organizer, string name, uint256 ticketSupply, uint256 ticketsMinted, uint256 priceWei, uint256 maxResaleMultiplierBps, bool disabled))',
  'event EventCreated(uint256 indexed eventId, address indexed organizer, string name, uint256 ticketSupply, uint256 priceWei, uint256 maxResaleMultiplierBps)',
];

const TICKET_NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getTicketInfo(uint256 _tokenId) view returns (tuple(uint256 eventId, uint256 originalPrice, uint256 maxResalePrice, bool isUsed))',
  'event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 indexed eventId, uint256 originalPrice, uint256 maxResalePrice)',
  'event TicketTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 salePrice)',
  'event TicketUsed(uint256 indexed tokenId)',
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private eventFactoryContract: ethers.Contract;
  private ticketNFTContract: ethers.Contract;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const network = this.config.get<string>('NETWORK') || 'localhost';
    const preset = NETWORK_PRESETS[network];
    if (!preset) {
      throw new Error(
        `Unknown NETWORK "${network}". Use: ${Object.keys(NETWORK_PRESETS).join(', ')}`,
      );
    }

    this.provider = new ethers.JsonRpcProvider(preset.rpcUrl);

    const factoryContractAddress = this.config.get<string>(
      'EVENT_FACTORY_CONTRACT_ADDRESS',
    );
    const nftContractAddress = this.config.get<string>(
      'TICKET_NFT_CONTRACT_ADDRESS',
    );

    if (factoryContractAddress) {
      this.eventFactoryContract = new ethers.Contract(
        factoryContractAddress,
        EVENT_FACTORY_ABI,
        this.provider,
      );
    }

    if (nftContractAddress) {
      this.ticketNFTContract = new ethers.Contract(
        nftContractAddress,
        TICKET_NFT_ABI,
        this.provider,
      );
    }
  }

  async verifyTransaction(txHash: string): Promise<ethers.TransactionReceipt> {
    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new Error('Transaction not found');
    }
    if (receipt.status !== 1) {
      throw new Error('Transaction failed on-chain');
    }
    return receipt;
  }

  parseTicketMintedLogs(receipt: ethers.TransactionReceipt) {
    if (!this.ticketNFTContract) return [];
    const iface = this.ticketNFTContract.interface;
    return receipt.logs
      .map((log) => {
        try {
          return iface.parseLog({ topics: [...log.topics], data: log.data });
        } catch {
          return null;
        }
      })
      .filter((parsed) => parsed && parsed.name === 'TicketMinted');
  }
}
