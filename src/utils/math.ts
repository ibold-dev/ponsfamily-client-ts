import { BPS } from "../constants.js";

/**
 * Ceiling division: ⌈a / b⌉
 */
export function ceilDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error("Division by zero");
  return (a + b - 1n) / b;
}

/**
 * Constant product amountOut: given `inAmount` going in, compute how much
 * comes out. No fees applied — caller deducts fees before or after.
 *
 * Formula: out = (in * reserveOut) / (reserveIn + in)
 */
export function amountOut(
  inAmount: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
): bigint {
  if (inAmount === 0n || reserveIn === 0n || reserveOut === 0n) return 0n;
  return (inAmount * reserveOut) / (reserveIn + inAmount);
}

/**
 * Constant product amountIn: given `outAmount` desired out, compute how much
 * must go in. Includes +1n rounding up.
 *
 * Formula: in = (out * reserveIn) / (reserveOut - out) + 1
 */
export function amountIn(
  outAmount: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
): bigint {
  if (outAmount === 0n || reserveOut === 0n) return 0n;
  if (outAmount >= reserveOut) throw new Error("Output exceeds reserve");
  return (outAmount * reserveIn) / (reserveOut - outAmount) + 1n;
}

/**
 * Apply a basis-point fee to an amount.
 * Returns the fee amount (not the net).
 */
export function applyBps(amount: bigint, bps: bigint): bigint {
  return (amount * bps) / BPS;
}

/**
 * Subtract a basis-point fee from an amount, returning the net.
 */
export function subtractBps(amount: bigint, bps: bigint): bigint {
  return amount - applyBps(amount, bps);
}

/**
 * Compute the marginal price of one token in the quote asset.
 * Returns a floating-point number for display purposes only.
 */
export function marginalPrice(quoteReserve: bigint, tokenReserve: bigint): number {
  if (tokenReserve === 0n) return 0;
  return Number(quoteReserve) / Number(tokenReserve);
}

/**
 * Compute graduation progress as a fraction (0..1).
 */
export function graduationProgress(raised: bigint, threshold: bigint): number {
  if (threshold === 0n) return 0;
  const clamped = raised > threshold ? threshold : raised;
  return Number(clamped) / Number(threshold);
}
