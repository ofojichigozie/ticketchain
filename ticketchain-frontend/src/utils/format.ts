import { ethers } from 'ethers';

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(weiOrEth: string | bigint, decimals = 4): string {
  if (typeof weiOrEth === 'bigint') {
    return parseFloat(ethers.formatEther(weiOrEth)).toFixed(decimals);
  }
  return parseFloat(weiOrEth).toFixed(decimals);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateMaxResalePrice(
  basePriceEth: string,
  multiplierBps: number,
): string {
  const max = (parseFloat(basePriceEth) * multiplierBps) / 10000;
  return max.toFixed(8);
}
