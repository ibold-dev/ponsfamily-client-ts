/**
 * Example 06: Claim Fees
 *
 * Shows how to check and claim accumulated fees from the fee escrow.
 * Demonstrates both native ETH and ERC-20 token fee claims.
 */

import { createPonsClient, formatETH, type Address } from "../src/index.js";

const CREATOR_ADDRESS: Address = "0x0000000000000000000000000000000000000001";
const QUOTE_ASSET: Address = "0x0000000000000000000000000000000000000000";

async function main() {
  const pons = createPonsClient({
    rpcUrl: "https://rpc.robinhood.com",
  });

  // 1. Check native ETH balance (from ETH-paired launches)
  const ethBalance = await pons.fees.getBalance(CREATOR_ADDRESS);
  console.log(`Native ETH fees: ${formatETH(ethBalance)}`);

  // 2. Check ERC-20 balance (from custom-pair launches)
  const erc20Balance = await pons.fees.getERC20Balance(
    CREATOR_ADDRESS,
    QUOTE_ASSET,
  );
  console.log(`ERC-20 fees (${QUOTE_ASSET}): ${erc20Balance}`);

  // 3. Check fee policy for a specific token
  const tokenAddress: Address = "0x0000000000000000000000000000000000000002";
  const policy = await pons.fees.getFeePolicy(tokenAddress);
  console.log("\nFee Policy:");
  console.log(`  Protocol Recipient:     ${policy.protocolFeeRecipient}`);
  console.log(`  Protocol Share:         ${policy.protocolFeeShareBps} bps`);
  console.log(`  Buyback Burn:           ${policy.buybackBurnBps} bps`);
  console.log(`  Hook Fee:               ${policy.hookFeeBps} bps`);
  console.log(`  Max Price Impact:       ${policy.maxInternalPriceImpactBps} bps`);

  // 4. Claim fees (requires wallet)
  // Uncomment when you have a wallet configured:
  //
  // if (ethBalance > 0n) {
  //   const hash = await pons.fees.claim();
  //   console.log(`\nClaimed ETH fees: tx ${hash}`);
  // }
  //
  // if (erc20Balance > 0n) {
  //   const hash = await pons.fees.claimToken(QUOTE_ASSET);
  //   console.log(`\nClaimed ERC-20 fees: tx ${hash}`);
  // }
}

main().catch(console.error);
