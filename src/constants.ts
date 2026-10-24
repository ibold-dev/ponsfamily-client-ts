import { type Address } from "viem";

/** Robinhood Chain chain ID */
export const ROBINHOOD_CHAIN_ID = 4663 as const;

/** Basis points denominator (100%) */
export const BPS = 10_000n as const;

/** Zero address — used for native ETH pair */
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

// ── Deployed Contract Addresses (Robinhood Chain) ──────────────────────────

export const ADDRESSES = {
  factory: "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e" as Address,
  memeHook: "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044" as Address,
  feeEscrow: "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e" as Address,
  buybackVault: "0x42df2a798f82289E177311362e8f5ccC45c1219c" as Address,
  launchLocker: "0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952" as Address,
  launchAndBuy: "0xe33E9E479dF8802cb0866d5d05258bEc4cF62948" as Address,
  launchDeployer: "0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42" as Address,
  graduationExecutor: "0xC7819B64A1dAECD7eC19856d026cb14EfBd89046" as Address,
  graduationGuard: "0xf5695117b99B6f6401e67d4195BD653628176C6C" as Address,
} as const;

// ── Launch Phases ──────────────────────────────────────────────────────────

export const PHASE = {
  NotGraduated: 0,
  Swept: 1,
  PoolCreated: 2,
  Rescued: 3,
} as const;

export type Phase = (typeof PHASE)[keyof typeof PHASE];

// ── Constants ──────────────────────────────────────────────────────────────

/** Snipe tax decay window in EVM timestamp seconds (block.timestamp units) */
export const SNIPE_TAX_DECAY_SECS = 5n as const;

/**
 * Snipe tax decay window expressed in nanoseconds (5 seconds).
 * @deprecated Use SNIPE_TAX_DECAY_SECS when comparing against block timestamps.
 * This alias preserves its original nanosecond value for backward compatibility.
 */
export const SNIPE_TAX_DECAY_NS = 5_000_000_000n as const;

/** Maximum number of snipe tax exemptions per launch */
export const MAX_SNIPE_EXEMPTIONS = 32 as const;

/** Buyback vesting duration (5 years in seconds) */
export const VESTING_DURATION_SECS = 157_680_000n as const;

/** Migration claim window (90 days in seconds) */
export const MIGRATION_CLAIM_WINDOW_SECS = 7_776_000n as const;
