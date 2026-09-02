/**
 * Example 04: On-Chain Quote
 *
 * Demonstrates the local bonding curve math for computing trade quotes
 * without making additional RPC calls. Useful for aggregators and routers.
 */

import { createPonsClient, amountOut, amountIn, ceilDiv, BPS, type Address } from "../src/index.js";
import { parseEther } from "viem";

const CURVE_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // Read current curve state
  const state = await pons.curve.getState(CURVE_ADDRESS);
  const { quoteReserve, tokenReserve } = state.reserves;

  console.log("Current Reserves:");
  console.log(`  Quote: ${quoteReserve}`);
  console.log(`  Token: ${tokenReserve}`);
  console.log();

  // Compute local buy quote (no RPC needed)
  const quoteIn = parseEther("1.0");
  const feeBps = state.feeBps;
  const creatorTaxBps = state.creatorTaxBps;

  // Deduct fees before pricing
  const fee = (quoteIn * feeBps) / BPS;
  const tax = (quoteIn * creatorTaxBps) / BPS;
  const netIn = quoteIn - fee - tax;

  const tokensOut = amountOut(netIn, quoteReserve, tokenReserve);
  console.log(`Local Buy Quote for 1.0 ETH:`);
  console.log(`  Fee:        ${fee} wei`);
  console.log(`  Tax:        ${tax} wei`);
  console.log(`  Net Input:  ${netIn} wei`);
  console.log(`  Tokens Out: ${tokensOut}`);
  console.log();

  // Compute local sell quote
  const tokensIn = tokensOut / 2n;
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

main().catch(console.error);
