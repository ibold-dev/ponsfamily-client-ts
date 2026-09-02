import { type Address, type PublicClient, encodeAbiParameters, keccak256 } from "viem";
import { hookAbi } from "../../abis/hook.js";
import type { LaunchedToken, PoolKey, PoolModule } from "../../types.js";

type ContractAddresses = { memeHook: Address };

export function createPoolModule(
  publicClient: PublicClient,
  addresses: ContractAddresses,
): PoolModule {
  return {
    buildPoolKey(launch: LaunchedToken): PoolKey {
      // Uniswap v4 sorts currencies by address. Native ETH (zero address)
      // always takes the currency0 slot.
      const [currency0, currency1] =
        launch.pairToken.toLowerCase() < launch.token.toLowerCase()
          ? [launch.pairToken, launch.token]
          : [launch.token, launch.pairToken];

      return {
        currency0,
        currency1,
        fee: launch.poolFee,
        tickSpacing: launch.tickSpacing,
        hooks: addresses.memeHook,
      };
    },

    getPoolId(launch: LaunchedToken): `0x${string}` {
      const poolKey = this.buildPoolKey(launch);
      return keccak256(
        encodeAbiParameters(
          [
            { type: "address" },
            { type: "address" },
            { type: "uint24" },
            { type: "int24" },
            { type: "address" },
          ],
          [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks],
        ),
      );
    },

    async pendingFees(poolId: `0x${string}`, currency: Address): Promise<bigint> {
      return publicClient.readContract({
        address: addresses.memeHook,
        abi: hookAbi,
        functionName: "pendingFees",
        args: [poolId, currency],
      });
    },

    async pendingCreatorTax(poolId: `0x${string}`, currency: Address): Promise<bigint> {
      return publicClient.readContract({
        address: addresses.memeHook,
        abi: hookAbi,
        functionName: "pendingCreatorTax",
        args: [poolId, currency],
      });
    },
  };
}
