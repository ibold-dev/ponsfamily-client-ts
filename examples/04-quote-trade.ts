/**
 * Example 04: On-Chain Quote
 *
 * Local bonding curve math for computing trade quotes without additional RPC calls.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   CURVE_ADDRESS  — Live curve contract address
 */

import dotenv from "dotenv";
import { createPonsClient, amountOut, amountIn, ceilDiv, BPS, type Address } from "../src/index.js";
import { parseEther } from "viem";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const CURVE_ADDRESS = process.env.CURVE_ADDRESS!;
if (!RPC_URL || !CURVE_ADDRESS) {
  console.error("Set RPC_URL and CURVE_ADDRESS env vars");
  process.exit(1);
}

async function main() {
  const pons = createPonsClient({ rpcUrl: RPC_URL });

  const state = await pons.curve.getState(CURVE_ADDRESS as Address);
  const { quoteReserve, tokenReserve } = state.reserves;

  console.log("Current Reserves:");
  console.log(`  Quote: ${quoteReserve}`);
  console.log(`  Token: ${tokenReserve}`);
  console.log();

  // Compute local buy quote (no RPC needed beyond initial state read)
  const quoteIn = parseEther("1.0");
  const feeBps = state.feeBps;
  const creatorTaxBps = state.creatorTaxBps;

  const fee = (quoteIn * feeBps) / BPS;
  const tax = (quoteIn * creatorTaxBps) / BPS;
  const netIn = quoteIn - fee - tax;
  const tokensOut = amountOut(netIn, quoteReserve, tokenReserve);

  console.log("Local Buy Quote for 1.0 ETH:");
  console.log(`  Fee:        ${fee} wei`);
  console.log(`  Tax:        ${tax} wei`);
  console.log(`  Net Input:  ${netIn} wei`);
  console.log(`  Tokens Out: ${tokensOut}`);
  console.log();

  // Compute local sell quote
  const tokensIn = tokensOut / 2n;
  if (tokensIn > 0n) {
    const grossOut = amountOut(tokensIn, tokenReserve, quoteReserve);
    const sellFee = (grossOut * feeBps) / BPS;
    const sellTax = (grossOut * creatorTaxBps) / BPS;
    const netOut = grossOut - sellFee - sellTax;

    console.log(`Local Sell Quote for ${tokensIn} tokens:`);
    console.log(`  Gross Out:  ${grossOut} wei`);
    console.log(`  Fee:        ${sellFee} wei`);
    console.log(`  Tax:        ${sellTax} wei`);
    console.log(`  Net Out:    ${netOut} wei`);
  }
}

main().catch(console.error);
