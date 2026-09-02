/**
 * Example 03: Buy and Sell on the Bonding Curve
 *
 * Demonstrates how to trade against a launch's bonding curve before
 * graduation. Shows buy, quote, and sell operations.
 */

import { createPonsClient, type Address } from "../src/index.js";
import { parseEther } from "viem";

// Replace with a live curve address
const CURVE_ADDRESS: Address = "0x0000000000000000000000000000000000000000";
const RECIPIENT: Address = "0x0000000000000000000000000000000000000001";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // 1. Check curve state
  const state = await pons.curve.getState(CURVE_ADDRESS);
  console.log("Curve State:");
  console.log(`  Quote Reserve:    ${state.reserves.quoteReserve}`);
  console.log(`  Token Reserve:    ${state.reserves.tokenReserve}`);
  console.log(`  Sellable Tokens:  ${state.sellableTokens}`);
  console.log(`  Fee:              ${state.feeBps} bps`);
  console.log(`  Creator Tax:      ${state.creatorTaxBps} bps`);
  console.log(`  Graduated:        ${state.graduated}`);
  console.log();

  if (state.graduated) {
    console.log("Curve has graduated — trade on the Uniswap v4 pool instead");
    return;
  }

  // 2. Quote a buy
  const buyAmount = parseEther("0.01");
  const buyQuote = await pons.curve.quoteBuy(CURVE_ADDRESS, buyAmount, RECIPIENT);
  console.log("Buy Quote:");
  console.log(`  Tokens Out:  ${buyQuote.tokensOut}`);
  console.log(`  Spent:       ${buyQuote.spent}`);
  console.log(`  Refund:      ${buyQuote.refund}`);
  console.log();

  // 3. Quote a sell (use a fraction of what we'd buy)
  const sellAmount = buyQuote.tokensOut / 2n;
  if (sellAmount > 0n) {
    const sellQuote = await pons.curve.quoteSell(CURVE_ADDRESS, sellAmount);
    console.log("Sell Quote:");
    console.log(`  Quote Out: ${sellQuote.quoteOut}`);
    console.log();
  }

  // 4. Check snipe tax (will be 0 after 5 seconds)
  const snipeTax = await pons.curve.currentSnipeTaxBps(CURVE_ADDRESS, RECIPIENT);
  console.log(`Snipe Tax: ${snipeTax} bps`);

  // 5. Check graduation readiness
  const ready = await pons.curve.readyToGraduate(CURVE_ADDRESS);
  console.log(`Ready to graduate: ${ready}`);
}

main().catch(console.error);
