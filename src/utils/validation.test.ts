import { describe, it, expect } from "vitest";
import {
  requireValidAddress,
  requireValidCreatorTax,
  requireValidExemptions,
  requirePositiveAmount,
  requireValidSlippage,
  minOutputWithSlippage,
} from "../utils/validation.js";
import { BPS, MAX_SNIPE_EXEMPTIONS } from "../constants.js";
import { type Address } from "viem";

const VALID_ADDRESS: Address = "0x0000000000000000000000000000000000000001";

describe("requireValidAddress", () => {
  it("passes for valid address", () => {
    expect(() => requireValidAddress(VALID_ADDRESS, "test")).not.toThrow();
  });

  it("throws for invalid address", () => {
    expect(() => requireValidAddress("0xinvalid" as Address, "test")).toThrow(
      "Invalid test address",
    );
  });
});

describe("requireValidCreatorTax", () => {
  it("passes for valid tax", () => {
    expect(() => requireValidCreatorTax(500, 1000n)).not.toThrow();
  });

  it("throws for negative tax", () => {
    expect(() => requireValidCreatorTax(-1, 1000n)).toThrow("negative");
  });

  it("throws for tax exceeding max", () => {
    expect(() => requireValidCreatorTax(1500, 1000n)).toThrow("exceeds");
  });
});

describe("requireValidExemptions", () => {
  it("passes for empty list", () => {
    expect(() => requireValidExemptions([])).not.toThrow();
  });

  it("passes for list within limit", () => {
    const list = Array(MAX_SNIPE_EXEMPTIONS).fill(VALID_ADDRESS) as Address[];
    expect(() => requireValidExemptions(list)).not.toThrow();
  });

  it("throws for list exceeding limit", () => {
    const list = Array(MAX_SNIPE_EXEMPTIONS + 1).fill(VALID_ADDRESS) as Address[];
    expect(() => requireValidExemptions(list)).toThrow("too long");
  });
});

describe("requirePositiveAmount", () => {
  it("passes for positive amount", () => {
    expect(() => requirePositiveAmount(1n, "amount")).not.toThrow();
  });

  it("throws for zero", () => {
    expect(() => requirePositiveAmount(0n, "amount")).toThrow("must be positive");
  });

  it("throws for negative", () => {
    expect(() => requirePositiveAmount(-1n, "amount")).toThrow("must be positive");
  });
});

describe("requireValidSlippage", () => {
  it("passes for valid slippage", () => {
    expect(() => requireValidSlippage(500)).not.toThrow();
  });

  it("throws for negative", () => {
    expect(() => requireValidSlippage(-1)).toThrow("Invalid slippage");
  });

  it("throws for over 100%", () => {
    expect(() => requireValidSlippage(10001)).toThrow("Invalid slippage");
  });
});

describe("minOutputWithSlippage", () => {
  it("computes minimum with 5% slippage", () => {
    const result = minOutputWithSlippage(1000n, 500);
    expect(result).toBe(950n);
  });

  it("computes minimum with 0% slippage", () => {
    const result = minOutputWithSlippage(1000n, 0);
    expect(result).toBe(1000n);
  });

  it("computes minimum with 100% slippage", () => {
    const result = minOutputWithSlippage(1000n, Number(BPS));
    expect(result).toBe(0n);
  });
});
