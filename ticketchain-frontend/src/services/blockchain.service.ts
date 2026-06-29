import { ethers } from 'ethers';
import {
  EVENT_FACTORY_ADDRESS,
  TICKET_NFT_ADDRESS,
  EVENT_FACTORY_ABI,
  TICKET_NFT_ABI,
} from '../utils/constants';

function getProvider(): ethers.BrowserProvider {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = getProvider();
  return provider.getSigner();
}

function getEventFactoryContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
) {
  return new ethers.Contract(
    EVENT_FACTORY_ADDRESS,
    EVENT_FACTORY_ABI,
    signerOrProvider,
  );
}

function getTicketNFTContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
) {
  return new ethers.Contract(
    TICKET_NFT_ADDRESS,
    TICKET_NFT_ABI,
    signerOrProvider,
  );
}

export const blockchainService = {
  createEvent: async (
    name: string,
    ticketSupply: number,
    priceWei: bigint,
    maxResaleMultiplierBps: number,
    maxTicketsPerWallet: number,
  ): Promise<{ txHash: string; onChainEventId: number }> => {
    const signer = await getSigner();
    const factory = getEventFactoryContract(signer);
    const tx = await factory.createEvent(
      name,
      ticketSupply,
      priceWei,
      maxResaleMultiplierBps,
      maxTicketsPerWallet,
    );
    const receipt = await tx.wait();

    const iface = new ethers.Interface(EVENT_FACTORY_ABI);
    let onChainEventId: number | null = null;
    for (const log of receipt.logs) {
      const parsed = iface.parseLog(log);
      if (parsed?.name === 'EventCreated') {
        onChainEventId = Number(parsed.args[0]);
        break;
      }
    }
    if (onChainEventId === null) {
      throw new Error('EventCreated log not found in transaction receipt');
    }

    return { txHash: receipt.hash, onChainEventId };
  },

  purchaseTicket: async (eventId: number, priceWei: bigint) => {
    const signer = await getSigner();
    const factory = getEventFactoryContract(signer);
    const tx = await factory.purchaseTicket(eventId, { value: priceWei });
    const receipt = await tx.wait();
    return receipt;
  },

  resaleTransfer: async (to: string, tokenId: number, salePriceWei: bigint) => {
    const signer = await getSigner();
    const nft = getTicketNFTContract(signer);
    const tx = await nft.buyResaleTicket(to, tokenId, salePriceWei, {
      value: salePriceWei,
    });
    const receipt = await tx.wait();
    return receipt;
  },

  markTicketUsed: async (tokenId: number) => {
    const signer = await getSigner();
    const nft = getTicketNFTContract(signer);
    const tx = await nft.markAsUsed(tokenId);
    const receipt = await tx.wait();
    return receipt;
  },

  getOnChainEvent: async (eventId: number) => {
    const provider = getProvider();
    const factory = getEventFactoryContract(provider);
    return factory.getFunction('getEvent')!(eventId);
  },

  getTicketInfo: async (tokenId: number) => {
    const provider = getProvider();
    const nft = getTicketNFTContract(provider);
    return nft.getTicketInfo(tokenId);
  },

  approveMarketplace: async (operatorAddress: string) => {
    const signer = await getSigner();
    const nft = getTicketNFTContract(signer);
    const tx = await nft.setApprovalForAll(operatorAddress, true);
    const receipt = await tx.wait();
    return receipt;
  },
};
