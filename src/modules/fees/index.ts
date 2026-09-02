import {
  type Address,
  type PublicClient,
} from "viem";
import { escrowAbi } from "../../abis/escrow.js";
import { factoryAbi } from "../../abis/factory.js";
import { curveAbi } from "../../abis/curve.js";
import { hookAbi } from "../../abis/hook.js";
import type { FeesModule, FeePolicy, PonsWallet } from "../../types.js";

type ContractAddresses = { feeEscrow: Address; factory: Address; memeHook: Address };

export function createFesModule(
  publicClient: PublicClient,
  wallet: PonsWallet | undefined,
  addresses: ContractAddresses,
): FeesModule {
  return {
    async getBalance(recipient: Address): Promise<bigint> {
      return publicClient.readContract({
        address: addresses.feeEscrow,
        abi: escrowAbi,
        functionName: "balanceOf",
        args: [recipient],
      });
    },

    async getERC20Balance(
      recipient: Address,
      token: Address,
    ): Promise<bigint> {
      return publicClient.readContract({
        address: addresses.feeEscrow,
        abi: escrowAbi,
        functionName: "balanceOfToken",
        args: [recipient, token],
      });
    },

    async claim(): Promise<`0x${string}`> {
      if (!wallet) throw new Error("Wallet required for claim");
      const { request } = await publicClient.simulateContract({
        address: addresses.feeEscrow,
        abi: escrowAbi,
        functionName: "claim",
        account: wallet.account!,
      });
      return wallet.writeContract(request);
    },

    async claimToken(token: Address): Promise<`0x${string}`> {
      if (!wallet) throw new Error("Wallet required for claimToken");
      const { request } = await publicClient.simulateContract({
        address: addresses.feeEscrow,
        abi: escrowAbi,
        functionName: "claimToken",
        args: [token],
        account: wallet.account!,
      });
      return wallet.writeContract(request);
    },

    async getUnsweptBalance(
      curve: Address,
      creatorFeeRecipient: Address,
    ): Promise<{ pendingFees: bigint; pendingCreatorTax: bigint }> {
      const [pendingFees, pendingCreatorTax] = await Promise.all([
        publicClient.readContract({
          address: curve,
          abi: curveAbi,
          functionName: "quoteFeeBalance",
        }),
        publicClient.readContract({
          address: curve,
          abi: curveAbi,
          functionName: "creatorTaxBalance",
        }),
      ]);
      return { pendingFees, pendingCreatorTax };
    },

    async getHookPendingFees(
      poolId: `0x${string}`,
      quoteCurrency: Address,
    ): Promise<{ pendingFees: bigint; pendingCreatorTax: bigint }> {
      const [pendingFees, pendingCreatorTax] = await Promise.all([
        publicClient.readContract({
          address: addresses.memeHook,
          abi: hookAbi,
          functionName: "pendingFees",
          args: [poolId, quoteCurrency],
        }),
        publicClient.readContract({
          address: addresses.memeHook,
          abi: hookAbi,
          functionName: "pendingCreatorTax",
          args: [poolId, quoteCurrency],
        }),
      ]);
      return { pendingFees, pendingCreatorTax };
    },

    async getFeePolicy(token: Address): Promise<FeePolicy> {
      return publicClient.readContract({
        address: addresses.factory,
        abi: factoryAbi,
        functionName: "getLaunchFeePolicy",
        args: [token],
      });
    },
  };
}
