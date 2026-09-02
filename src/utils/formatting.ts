import { type Address, formatEther, formatUnits, getAddress, isAddress } from "viem";
import { ZERO_ADDRESS } from "../constants.js";

/**
 * Normalize an address to checksummed form.
 * Returns ZERO_ADDRESS for nullish inputs.
 */
export function normalizeAddress(address?: Address | string | null): Address {
  if (!address || address === ZERO_ADDRESS) return ZERO_ADDRESS;
  return getAddress(address);
}

/**
 * Check if a value looks like a valid Ethereum address.
 */
export function isValidAddress(address: string): address is Address {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Format a native ETH value (18 decimals) to a human-readable string.
 */
export function formatETH(value: bigint): string {
  return formatEther(value);
}

/**
 * Format a token amount using its decimal count.
 */
export function formatTokenAmount(value: bigint, decimals: number): string {
  return formatUnits(value, decimals);
}

/**
 * Parse a human-readable ETH string to bigint wei.
 * Uses viem's parseEther under the hood.
 */
export { parseEther, parseUnits } from "viem";

/**
 * Shorten an address for display: 0x1234...5678
 */
export function shortenAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
