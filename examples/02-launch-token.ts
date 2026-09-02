/**
 * Example 02: Launch a Token
 *
 * Creates a new token launch using the atomic launch-and-buy pattern.
 *
 * Env vars:
 *   RPC_URL       — Robinhood Chain RPC endpoint
 *   PRIVATE_KEY   — Wallet private key (with funds for launch fee + buy)
 */

import dotenv from "dotenv";
import { createPonsClient, ZERO_ADDRESS, type TokenParams } from "../src/index.js";
import { createWalletClient, http, parseEther, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RobinhoodChain } from "./utils/chain.js";

dotenv.config({ path: ".env" });

const RPC_URL = process.env.RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
if (!RPC_URL || !PRIVATE_KEY) {
  console.error("Set RPC_URL and PRIVATE_KEY env vars");
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

  // 1. Get available configs
  const configs = await pons.factory.openLaunchConfigs();
  if (configs.length === 0) {
    console.log("No open launch configs available");
    return;
  }
  const configId = configs[0]!.id;
  console.log(`Using config #${configId}`);

  // 2. Check launch eligibility
  const canLaunch = await pons.factory.canLaunch(account.address);
  if (!canLaunch) {
    console.log("Address not whitelisted to launch");
    return;
  }

  // 3. Generate a random salt
  const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));

  // 4. Prepare token params
  const params: TokenParams = {
    name: "Example Token",
    symbol: "EXMPL",
    logo: "ipfs://QmExample...",
    description: "An example token launched via pons-client",
    socials: {
      twitter: "https://twitter.com/example",
      telegram: "",
      discord: "",
      website: "https://example.com",
      farcaster: "",
    },
    creatorFeeRecipient: account.address,
    creatorTaxBps: 0,
    buybackEnabled: true,
    expectedEconomics: "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt,
  };

  // 5. Launch and buy atomically
  const buyAmount = parseEther("0.1");
  const result = await pons.factory.launchAndBuy(
    params,
    configId,
    ZERO_ADDRESS,
    buyAmount,
    0n,
    account.address,
  );

  console.log(`Launch tx: ${result.hash}`);
  console.log(`Token:     ${result.token}`);
  console.log(`Curve:     ${result.curve}`);
  console.log(`Tokens:    ${result.tokensOut}`);
}

main().catch(console.error);
