import {
  type Address,
  type PublicClient,
} from "viem";
import { factoryAbi } from "../../abis/factory.js";
import type { TakeoverModule, PendingTakeover } from "../../types.js";
import { ZERO_ADDRESS } from "../../constants.js";

type ContractAddresses = { factory: Address };

export function createTakeoverModule(
  publicClient: PublicClient,
  addresses: ContractAddresses,
): TakeoverModule {
  return {
    async getPending(token: Address): Promise<PendingTakeover> {
      const [recipient, effectiveAt, expiresAt] = await publicClient.readContract({
        address: addresses.factory,
        abi: factoryAbi,
        functionName: "pendingCreatorFeeRecipient",
        args: [token],
      });

      const isPending =
        recipient !== ZERO_ADDRESS &&
        effectiveAt > 0n &&
        expiresAt > 0n;

      return {
        proposedRecipient: recipient,
        effectiveAt,
        expiresAt,
        isPending,
      };
    },
  };
}
