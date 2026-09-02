import {
  type Address,
  type PublicClient,
  createPublicClient,
  decodeEventLog,
  http,
} from "viem";
import { ROBINHOOD_CHAIN_ID, ADDRESSES } from "./constants.js";
import type { PonsClientConfig, PonsWallet } from "./types.js";
import { createFactoryModule } from "./modules/factory/index.js";
import { createCurveModule } from "./modules/curve/index.js";
import { createPoolModule } from "./modules/pool/index.js";
import { createFesModule } from "./modules/fees/index.js";
import { createBuybackModule } from "./modules/buyback/index.js";
import { createEventsModule } from "./modules/events/index.js";
import { createTakeoverModule } from "./modules/takeover/index.js";
import { createMigrationModule } from "./modules/migration/index.js";

/** Robinhood Chain definition for viem */
const robinhoodChain = {
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.robinhood.com"] },
  },
} as const;

export interface PonsClient {
  publicClient: PublicClient;
  wallet: PonsWallet | undefined;
  chainId: number;
  factory: ReturnType<typeof createFactoryModule>;
  curve: ReturnType<typeof createCurveModule>;
  pool: ReturnType<typeof createPoolModule>;
  fees: ReturnType<typeof createFesModule>;
  buyback: ReturnType<typeof createBuybackModule>;
  events: ReturnType<typeof createEventsModule>;
  takeover: ReturnType<typeof createTakeoverModule>;
  migration: ReturnType<typeof createMigrationModule>;
}

/** Type for the deployed addresses record */
export type DeployedAddresses = typeof ADDRESSES;

/**
 * Create a typed Pons v2 client.
 *
 * @example
 * ```ts
 * import { createPonsClient } from '@robhdev/pons-client';
 *
 * // Read-only client
 * const pons = createPonsClient({ rpcUrl: 'https://...' });
 * const configs = await pons.factory.openLaunchConfigs();
 *
 * // Write client with wallet
 * const pons = createPonsClient({
 *   rpcUrl: 'https://...',
 *   wallet: walletClient,
 * });
 * await pons.factory.launchToken(params, 0n, ZERO_ADDRESS);
 * ```
 */
export function createPonsClient(config: PonsClientConfig): PonsClient {
  const chain = {
    ...robinhoodChain,
    id: config.chainId ?? ROBINHOOD_CHAIN_ID,
  };

  const publicClient: PublicClient =
    config.publicClient ??
    createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    });

  const wallet = config.wallet;

  const addresses: DeployedAddresses = ADDRESSES;

  const factory = createFactoryModule(publicClient, wallet, addresses);
  const curve = createCurveModule(publicClient, wallet, addresses);
  const pool = createPoolModule(publicClient, addresses);
  const fees = createFesModule(publicClient, wallet, addresses);
  const buyback = createBuybackModule(publicClient, wallet, addresses);
  const events = createEventsModule(publicClient, addresses);
  const takeover = createTakeoverModule(publicClient, addresses);
  const migration = createMigrationModule(publicClient, wallet, addresses);

  return {
    publicClient,
    wallet,
    chainId: chain.id,
    factory,
    curve,
    pool,
    fees,
    buyback,
    events,
    takeover,
    migration,
  };
}

export { decodeEventLog };
export type { PonsClientConfig, PonsWallet };
