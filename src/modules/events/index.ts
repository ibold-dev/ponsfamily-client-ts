import { type Address, type PublicClient, parseAbiItem } from "viem";
import type {
  EventsModule,
  LaunchEvent,
  TradeEvent,
  FeeSweepEvent,
  TakeoverProposalEvent,
} from "../../types.js";

type ContractAddresses = { factory: Address; memeHook: Address };

export function createEventsModule(
  publicClient: PublicClient,
  addresses: ContractAddresses,
): EventsModule {
  return {
    async getLaunches(
      fromBlock: bigint,
      toBlock: bigint | "latest" = "latest",
    ): Promise<LaunchEvent[]> {
      const logs = await publicClient.getLogs({
        address: addresses.factory,
        event: parseAbiItem(
          "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
        ),
        fromBlock,
        toBlock,
      });

      return logs.map((log) => ({
        token: log.args.token as Address,
        curve: log.args.curve as Address,
        deployer: log.args.deployer as Address,
        pairToken: log.args.pairToken as Address,
        launchConfigId: log.args.launchConfigId as bigint,
        graduationThreshold: log.args.graduationThreshold as bigint,
        blockNumber: log.blockNumber!,
        transactionHash: log.transactionHash,
      }));
    },

    async getTrades(
      curve: Address,
      fromBlock: bigint,
      toBlock: bigint | "latest" = "latest",
    ): Promise<TradeEvent[]> {
      const logs = await publicClient.getLogs({
        address: curve,
        events: [
          parseAbiItem(
            "event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)",
          ),
          parseAbiItem(
            "event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)",
          ),
        ],
        fromBlock,
        toBlock,
      });

      const events: TradeEvent[] = [];
      for (const log of logs) {
        if (log.eventName === "CurveBuy") {
          events.push({
            type: "buy",
            buyer: log.args.buyer as Address,
            recipient: log.args.recipient as Address,
            quoteIn: log.args.quoteIn as bigint,
            tokensOut: log.args.tokensOut as bigint,
            fee: log.args.fee as bigint,
            tax: log.args.tax as bigint,
            blockNumber: log.blockNumber!,
            transactionHash: log.transactionHash,
          });
        } else if (log.eventName === "CurveSell") {
          events.push({
            type: "sell",
            seller: log.args.seller as Address,
            recipient: log.args.recipient as Address,
            tokensIn: log.args.tokensIn as bigint,
            quoteOut: log.args.quoteOut as bigint,
            fee: log.args.fee as bigint,
            tax: log.args.tax as bigint,
            blockNumber: log.blockNumber!,
            transactionHash: log.transactionHash,
          });
        }
      }
      return events;
    },

    async getFeeSweeps(
      hook: Address,
      fromBlock: bigint,
      toBlock: bigint | "latest" = "latest",
    ): Promise<FeeSweepEvent[]> {
      const logs = await publicClient.getLogs({
        address: hook,
        event: parseAbiItem(
          "event PoolFeesSwept(bytes32 indexed poolId, uint256 protocolAmount, uint256 buybackAmount, uint256 creatorAmount, uint256 tokensLocked)",
        ),
        fromBlock,
        toBlock,
      });

      return logs.map((log) => ({
        poolId: log.args.poolId as `0x${string}`,
        protocolAmount: log.args.protocolAmount as bigint,
        buybackAmount: log.args.buybackAmount as bigint,
        creatorAmount: log.args.creatorAmount as bigint,
        tokensLocked: log.args.tokensLocked as bigint,
        blockNumber: log.blockNumber!,
        transactionHash: log.transactionHash,
      }));
    },

    async getTakeoverProposals(
      fromBlock: bigint,
      toBlock: bigint | "latest" = "latest",
    ): Promise<TakeoverProposalEvent[]> {
      const logs = await publicClient.getLogs({
        address: addresses.factory,
        event: parseAbiItem(
          "event CreatorFeeRecipientChangeProposed(address indexed token, address indexed currentRecipient, address indexed newRecipient, uint256 effectiveAt, uint256 expiresAt)",
        ),
        fromBlock,
        toBlock,
      });

      return logs.map((log) => ({
        token: log.args.token as Address,
        currentRecipient: log.args.currentRecipient as Address,
        newRecipient: log.args.newRecipient as Address,
        effectiveAt: log.args.effectiveAt as bigint,
        expiresAt: log.args.expiresAt as bigint,
        blockNumber: log.blockNumber!,
        transactionHash: log.transactionHash,
      }));
    },
  };
}
