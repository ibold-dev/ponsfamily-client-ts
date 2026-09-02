/**
 * Example 12: Swap — Sell Tokens to Bonding Curve
 *
 * Sells tokens back to a bonding curve before graduation. Quotes first,
 * approves the curve if needed, then executes the trade.
 *
 * Env vars:
 *   RPC_URL        — Robinhood Chain RPC endpoint
 *   PRIVATE_KEY    — Wallet private key (holding tokens to sell)
 *   CURVE_ADDRESS  — Live curve contract address (phase 0, not graduated)
 *   TOKEN_ADDRESS  — The launch token contract address
 *   SELL_AMOUNT    — Amount of tokens to sell (e.g. "1000000")
 *   SLIPPAGE_BPS   — (optional) Slippage tolerance in bps, default 500 (5%)
 */

import dotenv from "dotenv";
import {
  createPonsClient,
  formatTokenAmount,
  minOutputWithSlippage,
  tokenAbi,
  type Address,
} from "../src/index.js";
import { createWalletClient, http, formatEther, maxUint256, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RobinhoodChain } from "./utils/chain.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CURVE_ADDRESS = process.env.CURVE_ADDRESS!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
const SELL_AMOUNT = process.env.SELL_AMOUNT!;
const SLIPPAGE_BPS = parseInt(process.env.SLIPPAGE_BPS ?? "500", 10);

if (!RPC_URL || !PRIVATE_KEY || !CURVE_ADDRESS || !TOKEN_ADDRESS || !SELL_AMOUNT) {
  console.error(
    "Set RPC_URL, PRIVATE_KEY, CURVE_ADDRESS, TOKEN_ADDRESS, and SELL_AMOUNT env vars",
  );
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
  const token = TOKEN_ADDRESS as Address;

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

  // 2. Read token balance
  const tokenBalance = await pons.publicClient.readContract({
    address: token,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [account.address],
  });

  const tokenDecimals = await pons.publicClient.readContract({
    address: token,
    abi: tokenAbi,
    functionName: "decimals",
  });

  const sellAmount = parseUnits(SELL_AMOUNT, tokenDecimals);
  console.log(`Token Balance: ${formatTokenAmount(tokenBalance, tokenDecimals)}`);
  console.log(`Sell Amount:   ${formatTokenAmount(sellAmount, tokenDecimals)}`);
  console.log();

  if (sellAmount > tokenBalance) {
    console.log("Insufficient token balance");
    return;
  }

  // 3. Quote the sell
  const quote = await pons.curve.quoteSell(curve, sellAmount);
  console.log("Sell Quote:");
  console.log(`  Quote Out: ${formatEther(quote.quoteOut)} ETH`);
  console.log();

  // 4. Apply slippage
  const minQuoteOut = minOutputWithSlippage(quote.quoteOut, SLIPPAGE_BPS);
  console.log(`Slippage tolerance: ${SLIPPAGE_BPS} bps (${(SLIPPAGE_BPS / 100).toFixed(1)}%)`);
  console.log(`Min quote out:      ${formatEther(minQuoteOut)} ETH`);
  console.log();

  // 5. Approve curve to spend tokens
  console.log("Approving curve to spend tokens...");
  const currentAllowance = await pons.publicClient.readContract({
    address: token,
    abi: tokenAbi,
    functionName: "allowance",
    args: [account.address, curve],
  });

  if (currentAllowance < sellAmount) {
    const approveHash = await pons.publicClient.simulateContract({
      address: token,
      abi: tokenAbi,
      functionName: "approve",
      args: [curve, maxUint256],
      account: account,
    });
    const tx = await walletClient.writeContract(approveHash.request);
    await pons.publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("  Approved");
  } else {
    console.log("  Already approved");
  }
  console.log();

  // 6. Execute the sell
  console.log("Sending sell transaction...");
  const result = await pons.curve.sell(curve, sellAmount, minQuoteOut, account.address);

  console.log();
  console.log("=== Sell Complete ===");
  console.log(`  TX:      ${result.hash}`);
  console.log(`  Received: ${formatEther(result.quoteOut)} ETH`);
}

main().catch(console.error);
