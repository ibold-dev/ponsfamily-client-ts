/**
 * Example 11: Swap — Buy Tokens from Bonding Curve
 *
 * Buys tokens on a bonding curve before graduation. Quotes first,
 * then executes the trade.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   PRIVATE_KEY    — Wallet private key (with ETH to spend)
 *   CURVE_ADDRESS  — Live curve contract address (phase 0, not graduated)
 *   BUY_AMOUNT     — Amount of ETH to spend (e.g. "0.01")
 *   SLIPPAGE_BPS   — (optional) Slippage tolerance in bps, default 500 (5%)
 */

import dotenv from "dotenv";
import { createPonsClient, formatETH, minOutputWithSlippage, type Address } from "../src/index.js";
import { createWalletClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RobinhoodChain } from "./utils/chain.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CURVE_ADDRESS = process.env.CURVE_ADDRESS!;
const BUY_AMOUNT = process.env.BUY_AMOUNT!;
const SLIPPAGE_BPS = parseInt(process.env.SLIPPAGE_BPS ?? "500", 10);

if (!RPC_URL || !PRIVATE_KEY || !CURVE_ADDRESS || !BUY_AMOUNT) {
  console.error("Set RPC_URL, PRIVATE_KEY, CURVE_ADDRESS, and BUY_AMOUNT env vars");
  process.exit(1);
}
if (Number.isNaN(SLIPPAGE_BPS) || SLIPPAGE_BPS < 0 || SLIPPAGE_BPS > 10000) {
  console.error("SLIPPAGE_BPS must be a number between 0 and 10000");
  process.exit(1);
}

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: RobinhoodChain,
    transport: http(RPC_URL),
  });

  const pons = createPonsClient({
    rpcUrl: RPC_URL,
    wallet: { account, writeContract: walletClient.writeContract },
  });

  const curve = CURVE_ADDRESS as Address;
  const quoteIn = parseEther(BUY_AMOUNT);

  // 1. Check curve state
  const state = await pons.curve.getState(curve);
  console.log("Curve State:");
  console.log(`  Fee:           ${state.feeBps} bps`);
  console.log(`  Creator Tax:   ${state.creatorTaxBps} bps`);
  console.log(`  Sellable:      ${state.sellableTokens}`);
  console.log(`  Graduated:     ${state.graduated}`);
  console.log();

  if (state.graduated) {
    console.log("Curve has graduated — use the Uniswap v4 pool instead");
    return;
  }

  // 2. Quote the buy
  const quote = await pons.curve.quoteBuy(curve, quoteIn, account.address);
  console.log("Buy Quote:");
  console.log(`  Spent:       ${formatETH(quote.spent)} ETH`);
  console.log(`  Tokens Out:  ${quote.tokensOut}`);
  console.log(`  Refund:      ${formatETH(quote.refund)} ETH`);
  console.log();

  // 3. Apply slippage
  const minTokensOut = minOutputWithSlippage(quote.tokensOut, SLIPPAGE_BPS);
  console.log(`Slippage tolerance: ${SLIPPAGE_BPS} bps (${(SLIPPAGE_BPS / 100).toFixed(1)}%)`);
  console.log(`Min tokens out:     ${minTokensOut}`);
  console.log();

  // 4. Execute the buy
  console.log("Sending buy transaction...");
  const result = await pons.curve.buy(curve, quoteIn, minTokensOut, account.address);

  console.log();
  console.log("=== Buy Complete ===");
  console.log(`  TX:      ${result.hash}`);
  console.log(`  Tokens:  ${result.tokensOut}`);
}

main().catch(console.error);
