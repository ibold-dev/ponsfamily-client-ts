import {
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { vaultAbi } from "../../abis/vault.js";
import type { BuybackModule, VestingState } from "../../types.js";

type ContractAddresses = { buybackVault: Address };

export function createBuybackModule(
  publicClient: PublicClient,
  walletClient: WalletClient | undefined,
  addresses: ContractAddresses,
): BuybackModule {
  return {
    async getState(token: Address): Promise<VestingState> {
      const [totalLocked, totalReleased, vestedAmount, releasable, vestingStart, vestingDuration] =
        await Promise.all([
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "totalLocked",
            args: [token],
          }),
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "totalReleased",
            args: [token],
          }),
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "vestedAmount",
            args: [token],
          }),
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "releasable",
            args: [token],
          }),
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "vestingStart",
            args: [token],
          }),
          publicClient.readContract({
            address: addresses.buybackVault,
            abi: vaultAbi,
            functionName: "VESTING_DURATION",
          }),
        ]);

      const progress = totalLocked > 0n
        ? Number(vestedAmount) / Number(totalLocked)
        : 0;

      return {
        totalLocked,
        totalReleased,
        vestedAmount,
        releasable,
        vestingStart,
        vestingDuration,
        progress,
      };
    },

    async release(token: Address): Promise<`0x${string}`> {
      if (!walletClient) throw new Error("Wallet client required for release");
      const { request } = await publicClient.simulateContract({
        address: addresses.buybackVault,
        abi: vaultAbi,
        functionName: "release",
        args: [token],
        account: walletClient.account!,
      });
      return walletClient.writeContract(request);
    },
  };
}
