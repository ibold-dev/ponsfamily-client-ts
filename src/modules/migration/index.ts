import { type Address, type PublicClient, parseAbi } from "viem";
import type { MigrationModule, MigrationStatus, MigrationEpoch, PonsWallet } from "../../types.js";

const migrationAbi = parseAbi([
  "function mandate() view returns (uint256)",
  "function totalDeposited() view returns (uint256)",
  "function settled() view returns (bool)",
  "function claimable() view returns (bool)",
  "function epochCount() view returns (uint256)",
  "function getEpoch(uint256 index) view returns (uint256 rate, uint256 cap, uint256 deposited, bool closed)",
  "function deposit(uint256 amount)",
  "function claim()",
]);

type ContractAddresses = Record<string, Address>;

export function createMigrationModule(
  publicClient: PublicClient,
  wallet: PonsWallet | undefined,
  _addresses: ContractAddresses,
): MigrationModule {
  return {
    async getStatus(migrationAddress: Address): Promise<MigrationStatus> {
      const mandate = await publicClient.readContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "mandate",
      });

      const totalDeposited = await publicClient.readContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "totalDeposited",
      });

      const settled = await publicClient.readContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "settled",
      });

      const claimable = await publicClient.readContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "claimable",
      });

      const epochCount = await publicClient.readContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "epochCount",
      });

      const epochPromises: Promise<MigrationEpoch>[] = [];
      for (let i = 0; i < Number(epochCount); i++) {
        epochPromises.push(
          publicClient
            .readContract({
              address: migrationAddress,
              abi: migrationAbi,
              functionName: "getEpoch",
              args: [BigInt(i)],
            })
            .then((result) => ({
              rate: result[0],
              cap: result[1],
              deposited: result[2],
              closed: result[3],
            })),
        );
      }

      const epochs = await Promise.all(epochPromises);

      return { mandate, totalDeposited, settled, claimable, epochs };
    },

    async deposit(migrationAddress: Address, amount: bigint): Promise<`0x${string}`> {
      if (!wallet) throw new Error("Wallet required for deposit");
      const { request } = await publicClient.simulateContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "deposit",
        args: [amount],
        account: wallet.account!,
      });
      return wallet.writeContract(request);
    },

    async claim(migrationAddress: Address): Promise<`0x${string}`> {
      if (!wallet) throw new Error("Wallet required for claim");
      const { request } = await publicClient.simulateContract({
        address: migrationAddress,
        abi: migrationAbi,
        functionName: "claim",
        account: wallet.account!,
      });
      return wallet.writeContract(request);
    },
  };
}
