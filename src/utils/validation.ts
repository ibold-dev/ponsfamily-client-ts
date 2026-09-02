import { type Address, isAddress } from "viem";
import { BPS, MAX_SNIPE_EXEMPTIONS } from "../constants.js";

/**
 * Validate an Ethereum address. Throws if invalid.
 */
export function requireValidAddress(address: Address, label: string): void {
  if (!isAddress(address)) {
    throw new Error(`Invalid ${label} address: ${address}`);
  }
}

/**
 * Validate creator tax is within protocol bounds.
 */
export function requireValidCreatorTax(taxBps: number, maxBps: bigint): void {
  if (taxBps < 0) {
    throw new Error("Creator tax cannot be negative");
  }
  if (BigInt(taxBps) > maxBps) {
    throw new Error(
      `Creator tax ${taxBps} bps exceeds protocol max ${maxBps} bps`,
    );
  }
}

/**
 * Validate snipe tax exemption list length.
 */
export function requireValidExemptions(exemptions: Address[]): void {
  if (exemptions.length > MAX_SNIPE_EXEMPTIONS) {
    throw new Error(
      `Snipe tax exemption list too long: ${exemptions.length} (max ${MAX_SNIPE_EXEMPTIONS})`,
    );
  }
}

/**
 * Validate that a quote amount is positive.
 */
export function requirePositiveAmount(amount: bigint, label: string): void {
  if (amount <= 0n) {
    throw new Error(`${label} must be positive, got ${amount}`);
  }
}

/**
 * Validate slippage tolerance (0-10000 bps).
 */
export function requireValidSlippage(slippageBps: number): void {
  if (slippageBps < 0 || slippageBps > Number(BPS)) {
    throw new Error(`Invalid slippage: ${slippageBps} bps (must be 0-${BPS})`);
  }
}

/**
 * Compute minimum output from a quoted amount and slippage tolerance.
 */
export function minOutputWithSlippage(
  quoted: bigint,
  slippageBps: number,
): bigint {
  const tolerance = (quoted * BigInt(slippageBps)) / BPS;
  return quoted - tolerance;
}
