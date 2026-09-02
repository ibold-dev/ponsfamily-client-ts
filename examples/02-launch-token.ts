/**
 * Example 02: Launch a Token
 *
 * Creates a new token launch on Pons v2. This example uses the atomic
 * launch-and-buy pattern to prevent front-running of the opening buy.
 */

import { createPonsClient, ZERO_ADDRESS, type TokenParams } from "../src/index.js";
import { parseEther, toHex, crypto } from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  // In production, use an environment variable for the private key
  const account = privateKeyToAccount(
    "0x0000000000000000000000000000000000000000000000000000000000000001",
  );

  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
    wallet: {
      account,
      chain: { id: 4663, name: "Robinhood Chain", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.robinhood.com"] } } },
      transport: undefined as never,
      type: "walletClient" as const,
      signMessage: undefined as never,
      signTransaction: undefined as never,
      signTypedData: undefined as never,
      writeContract: undefined as never,
      getAddresses: undefined as never,
      requestAddresses: undefined as never,
    },
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

  // 5. Launch and buy atomically (prevents front-running)
  const buyAmount = parseEther("0.1");

  const result = await pons.factory.launchAndBuy(
    params,
    configId,
    ZERO_ADDRESS, // native ETH pair
    buyAmount,
    0n, // minTokensOut (slippage protection — set properly in production)
    account.address,
  );

  console.log(`Launch tx: ${result.hash}`);
  console.log(`Token:     ${result.token}`);
  console.log(`Curve:     ${result.curve}`);
  console.log(`Tokens:    ${result.tokensOut}`);
}

main().catch(console.error);
