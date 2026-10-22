import { describe, expect, it } from "vitest";
import { type AbiEvent, toEventSignature } from "viem";
import { curveAbi, escrowAbi, factoryAbi, hookAbi, poolManagerAbi, vaultAbi } from "./index.js";

// Event signatures as declared by the verified Pons v2 sources (PonsV2BondingCurve, PonsV2FeeEscrow,
// PonsV2LaunchFactory, PonsV2MemeHook, PonsV2BuybackVault) and Uniswap v4-core's IPoolManager.
// A signature that differs here has a different topic0 and never matches an emitted log.
const DEPLOYED: Record<string, readonly AbiEvent[]> = {
  curve: curveAbi.filter((x): x is AbiEvent => x.type === "event"),
  escrow: escrowAbi.filter((x): x is AbiEvent => x.type === "event"),
  factory: factoryAbi.filter((x): x is AbiEvent => x.type === "event"),
  hook: hookAbi.filter((x): x is AbiEvent => x.type === "event"),
  poolManager: poolManagerAbi.filter((x): x is AbiEvent => x.type === "event"),
  vault: vaultAbi.filter((x): x is AbiEvent => x.type === "event"),
};

const EXPECTED: Record<string, string[]> = {
  curve: [
    "CurveBuy(address,address,uint256,uint256,uint256,uint256)",
    "CurveSell(address,address,uint256,uint256,uint256,uint256)",
    "CurveBuyRefunded(address,uint256)",
    "CurveCompleted(address,uint256,uint256)",
    "AutoGraduationFailed(address,uint256)",
    "FeesSwept(uint256,uint256,uint256)",
    "BuybackLocked(uint256,uint256)",
  ],
  escrow: [
    "Credited(address,address,uint256)",
    "Claimed(address,uint256)",
    "CreditedToken(address,address,address,uint256)",
    "ClaimedToken(address,address,uint256)",
  ],
  factory: [
    "TokenLaunched(address,address,address,address,uint256,uint256)",
    "LaunchSwept(address,uint256,uint256)",
    "PoolGraduated(address,uint256,uint256,uint256)",
    "CreatorFeeRecipientChangeProposed(address,address,address,uint256,uint256)",
    "CreatorFeeRecipientUpdated(address,address,address)",
  ],
  hook: [
    "PoolRegistered(bytes32,address,address,address)",
    "PoolFeesSwept(bytes32,uint256,uint256,uint256,uint256)",
    "PoolConversionSkipped(bytes32,uint256)",
    "PoolBuybackSkipped(bytes32,uint256)",
  ],
  poolManager: [
    "Swap(bytes32,address,int128,int128,uint160,uint128,int24,uint24)",
    "Initialize(bytes32,address,address,uint24,int24,address,uint160,int24)",
  ],
  vault: ["Locked(address,address,uint256,uint256)", "Released(address,uint256,uint256)"],
};

describe("ABI events match the deployed contracts", () => {
  for (const [name, events] of Object.entries(DEPLOYED)) {
    it(name, () => {
      expect(events.map((e) => toEventSignature(e))).toEqual(EXPECTED[name]);
    });
  }
});
