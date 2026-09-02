import { type Account, type Address, type Hex, type PublicClient, type WalletClient } from "viem";
import type { PHASE } from "./constants.js";

// ── Launch Configuration ───────────────────────────────────────────────────

export interface LaunchConfig {
  supply: bigint;
  curveFeeBps: bigint;
  phantomQuote: bigint;
  graduationThreshold: bigint;
  poolFee: number;
  tickSpacing: number;
  enabled: boolean;
}

export interface LaunchConfigWithId extends LaunchConfig {
  id: bigint;
}

// ── Launch Record ──────────────────────────────────────────────────────────

export interface LaunchedToken {
  token: Address;
  curve: Address;
  deployer: Address;
  creatorFeeRecipient: Address;
  pairToken: Address;
  graduationThreshold: bigint;
  poolFee: number;
  tickSpacing: number;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  phase: number;
  sweptQuote: bigint;
  sweptTokens: bigint;
  sweptAt: bigint;
  exists: boolean;
}

// ── Token Metadata ─────────────────────────────────────────────────────────

export interface Socials {
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
  farcaster: string;
}

export interface TokenParams {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: Socials;
  creatorFeeRecipient: Address;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  expectedEconomics: Hex;
  salt: Hex;
}

export interface TokenInfo {
  tokenDeployer: Address;
  tokenLogo: string;
  tokenDescription: string;
  tokenSocials: Socials;
}

// ── Curve State ────────────────────────────────────────────────────────────

export interface CurveReserves {
  quoteReserve: bigint;
  tokenReserve: bigint;
}

export interface CurveState {
  reserves: CurveReserves;
  realQuoteReserve: bigint;
  sellableTokens: bigint;
  graduationThreshold: bigint;
  readyToGraduate: boolean;
  graduated: boolean;
  feeBps: bigint;
  creatorTaxBps: bigint;
  buybackEnabled: boolean;
  isNativeQuote: boolean;
  pairToken: Address;
}

// ── Trade Quotes ───────────────────────────────────────────────────────────

export interface BuyQuote {
  tokensOut: bigint;
  spent: bigint;
  refund: bigint;
}

export interface SellQuote {
  quoteOut: bigint;
}

// ── Trade Results ──────────────────────────────────────────────────────────

export interface BuyResult {
  tokensOut: bigint;
  hash: `0x${string}`;
}

export interface SellResult {
  quoteOut: bigint;
  hash: `0x${string}`;
}

// ── Pool ───────────────────────────────────────────────────────────────────

export interface PoolKey {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

// ── Fee Policy ─────────────────────────────────────────────────────────────

export interface FeePolicy {
  protocolFeeRecipient: Address;
  protocolFeeShareBps: number;
  buybackBurnBps: number;
  hookFeeBps: number;
  maxInternalPriceImpactBps: number;
}

// ── Fee Balances ───────────────────────────────────────────────────────────

export interface FeeBalance {
  native: bigint;
  erc20: Record<Address, bigint>;
}

// ── Buyback Vesting ────────────────────────────────────────────────────────

export interface VestingState {
  totalLocked: bigint;
  totalReleased: bigint;
  vestedAmount: bigint;
  releasable: bigint;
  vestingStart: bigint;
  vestingDuration: bigint;
  progress: number;
}

// ── Pending Takeover ───────────────────────────────────────────────────────

export interface PendingTakeover {
  proposedRecipient: Address;
  effectiveAt: bigint;
  expiresAt: bigint;
  isPending: boolean;
}

// ── Quote Asset ────────────────────────────────────────────────────────────

export interface QuoteAsset {
  asset: Address;
  graduationThreshold: bigint;
  decimals: number;
}

// ── Client Configuration ───────────────────────────────────────────────────

/** Minimal wallet interface — only what the client needs for write operations */
export interface PonsWallet {
  account: Account;
  writeContract: WalletClient["writeContract"];
}

export interface PonsClientConfig {
  /** RPC URL for Robinhood Chain */
  rpcUrl: string;
  /** Optional wallet for write operations (signing + sending transactions) */
  wallet?: PonsWallet;
  /** Optional public client override */
  publicClient?: PublicClient;
  /** Chain override (defaults to Robinhood Chain 4663) */
  chainId?: number;
}

// ── Module Interfaces ──────────────────────────────────────────────────────

export interface FactoryModule {
  openLaunchConfigs(): Promise<LaunchConfigWithId[]>;
  getLaunchConfig(id: bigint): Promise<LaunchConfig>;
  getLaunchedToken(token: Address): Promise<LaunchedToken>;
  previewLaunchEconomics(
    configId: bigint,
    pairToken: Address,
  ): Promise<Hex>;
  launchFee(): Promise<bigint>;
  canLaunch(address: Address): Promise<boolean>;
  maxCreatorTaxBps(): Promise<bigint>;
  approvedPairTokens(pairToken: Address): Promise<boolean>;
  pairTokenEconomics(
    pairToken: Address,
  ): Promise<{ phantomQuote: bigint; graduationThreshold: bigint; decimals: number }>;
  launchToken(
    params: TokenParams,
    configId: bigint,
    pairToken: Address,
    snipeTaxExemptions?: Address[],
  ): Promise<`0x${string}`>;
  launchAndBuy(
    params: TokenParams,
    configId: bigint,
    pairToken: Address,
    quoteIn: bigint,
    minTokensOut: bigint,
    recipient: Address,
    snipeTaxExemptions?: Address[],
  ): Promise<{ hash: `0x${string}`; token: Address; curve: Address; tokensOut: bigint }>;
}

export interface CurveModule {
  buy(
    curve: Address,
    quoteIn: bigint,
    minTokensOut: bigint,
    recipient: Address,
    value?: bigint,
  ): Promise<BuyResult>;
  sell(
    curve: Address,
    tokensIn: bigint,
    minQuoteOut: bigint,
    recipient: Address,
  ): Promise<SellResult>;
  quoteBuy(curve: Address, quoteIn: bigint, recipient: Address): Promise<BuyQuote>;
  quoteSell(curve: Address, tokensIn: bigint): Promise<SellQuote>;
  getState(curve: Address): Promise<CurveState>;
  getReserves(curve: Address): Promise<CurveReserves>;
  sellableTokens(curve: Address): Promise<bigint>;
  readyToGraduate(curve: Address): Promise<boolean>;
  currentSnipeTaxBps(curve: Address, recipient: Address): Promise<bigint>;
}

export interface PoolModule {
  buildPoolKey(launch: LaunchedToken): PoolKey;
  getPoolId(launch: LaunchedToken): `0x${string}`;
  pendingFees(poolId: `0x${string}`, currency: Address): Promise<bigint>;
  pendingCreatorTax(poolId: `0x${string}`, currency: Address): Promise<bigint>;
}

export interface FeesModule {
  getBalance(recipient: Address): Promise<bigint>;
  getERC20Balance(recipient: Address, token: Address): Promise<bigint>;
  claim(): Promise<`0x${string}`>;
  claimToken(token: Address): Promise<`0x${string}`>;
  getUnsweptBalance(
    curve: Address,
    creatorFeeRecipient: Address,
  ): Promise<{ pendingFees: bigint; pendingCreatorTax: bigint }>;
  getHookPendingFees(
    poolId: `0x${string}`,
    quoteCurrency: Address,
  ): Promise<{ pendingFees: bigint; pendingCreatorTax: bigint }>;
  getFeePolicy(token: Address): Promise<FeePolicy>;
}

export interface BuybackModule {
  getState(token: Address): Promise<VestingState>;
  release(token: Address): Promise<`0x${string}`>;
}

export interface EventsModule {
  getLaunches(fromBlock: bigint, toBlock?: bigint | "latest"): Promise<LaunchEvent[]>;
  getTrades(
    curve: Address,
    fromBlock: bigint,
    toBlock?: bigint | "latest",
  ): Promise<TradeEvent[]>;
  getFeeSweeps(
    hook: Address,
    fromBlock: bigint,
    toBlock?: bigint | "latest",
  ): Promise<FeeSweepEvent[]>;
  getTakeoverProposals(
    fromBlock: bigint,
    toBlock?: bigint | "latest",
  ): Promise<TakeoverProposalEvent[]>;
}

export interface TakeoverModule {
  getPending(token: Address): Promise<PendingTakeover>;
}

export interface MigrationModule {
  getStatus(migrationAddress: Address): Promise<MigrationStatus>;
  deposit(migrationAddress: Address, amount: bigint): Promise<`0x${string}`>;
  claim(migrationAddress: Address): Promise<`0x${string}`>;
}

// ── Event Types ────────────────────────────────────────────────────────────

export interface LaunchEvent {
  token: Address;
  curve: Address;
  deployer: Address;
  pairToken: Address;
  launchConfigId: bigint;
  graduationThreshold: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface TradeEvent {
  type: "buy" | "sell";
  buyer?: Address;
  seller?: Address;
  recipient: Address;
  quoteIn?: bigint;
  tokensIn?: bigint;
  tokensOut?: bigint;
  quoteOut?: bigint;
  fee: bigint;
  tax: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface FeeSweepEvent {
  poolId: `0x${string}`;
  quoteFees: bigint;
  tokenFees: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface TakeoverProposalEvent {
  token: Address;
  newRecipient: Address;
  effectiveAt: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface MigrationStatus {
  mandate: bigint;
  totalDeposited: bigint;
  settled: boolean;
  claimable: boolean;
  epochs: MigrationEpoch[];
}

export interface MigrationEpoch {
  rate: bigint;
  cap: bigint;
  deposited: bigint;
  closed: boolean;
}
