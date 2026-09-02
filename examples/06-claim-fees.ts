/**
 * Example 06: Claim Fees
 *
 * Checks and claims accumulated fees from the fee escrow.
 *
 * Env vars:
 *   RPC_URL         — Robinhood Chain RPC endpoint
 *   PRIVATE_KEY     — Wallet private key (for claiming)
 *   CREATOR_ADDRESS — Address to check balances for
 *   QUOTE_ASSET     — (optional) ERC-20 quote asset to check/claim
 */

import dotenv from "dotenv";
import { createPonsClient, formatETH, type Address } from "../src/index.js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RobinhoodChain } from "./utils/chain.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CREATOR_ADDRESS = process.env.CREATOR_ADDRESS!;
if (!RPC_URL || !PRIVATE_KEY || !CREATOR_ADDRESS) {
  console.error("Set RPC_URL, PRIVATE_KEY, and CREATOR_ADDRESS env vars");
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

  // 1. Check native ETH balance
  const ethBalance = await pons.fees.getBalance(CREATOR_ADDRESS as Address);
  console.log(`Native ETH fees: ${formatETH(ethBalance)}`);

  // 2. Check ERC-20 balance if quote asset provided
  const quoteAsset = process.env.QUOTE_ASSET as Address | undefined;
  if (quoteAsset) {
    const erc20Balance = await pons.fees.getERC20Balance(
      CREATOR_ADDRESS as Address,
      quoteAsset,
    );
    console.log(`ERC-20 fees (${quoteAsset}): ${erc20Balance}`);
  }

  // 3. Claim native fees
  if (ethBalance > 0n) {
    const hash = await pons.fees.claim();
    console.log(`Claimed ETH fees: tx ${hash}`);
  }

  // 4. Claim ERC-20 fees
  if (quoteAsset) {
    const erc20Balance = await pons.fees.getERC20Balance(
      CREATOR_ADDRESS as Address,
      quoteAsset,
    );
    if (erc20Balance > 0n) {
      const hash = await pons.fees.claimToken(quoteAsset);
      console.log(`Claimed ERC-20 fees: tx ${hash}`);
    }
  }
}

main().catch(console.error);
