import { describe, it, expect } from "vitest";
import { BPS, PHASE, ROBINHOOD_CHAIN_ID, ADDRESSES, ZERO_ADDRESS } from "./constants.js";

describe("constants", () => {
  it("BPS is 10000", () => {
    expect(BPS).toBe(10_000n);
  });

  it("PHASE values are correct", () => {
    expect(PHASE.NotGraduated).toBe(0);
    expect(PHASE.Swept).toBe(1);
    expect(PHASE.PoolCreated).toBe(2);
    expect(PHASE.Rescued).toBe(3);
  });

  it("ROBINHOOD_CHAIN_ID is 4663", () => {
    expect(ROBINHOOD_CHAIN_ID).toBe(4663);
  });

  it("ADDRESSES has all required contracts", () => {
    expect(ADDRESSES.factory).toBeDefined();
    expect(ADDRESSES.memeHook).toBeDefined();
    expect(ADDRESSES.feeEscrow).toBeDefined();
    expect(ADDRESSES.buybackVault).toBeDefined();
    expect(ADDRESSES.launchLocker).toBeDefined();
    expect(ADDRESSES.launchAndBuy).toBeDefined();
    expect(ADDRESSES.launchDeployer).toBeDefined();
    expect(ADDRESSES.graduationExecutor).toBeDefined();
    expect(ADDRESSES.graduationGuard).toBeDefined();
  });

  it("ZERO_ADDRESS is the zero address", () => {
    expect(ZERO_ADDRESS).toBe("0x0000000000000000000000000000000000000000");
  });

  it("all addresses are valid checksummed addresses", () => {
    for (const [name, address] of Object.entries(ADDRESSES)) {
      expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });
});
