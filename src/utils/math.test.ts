import { describe, it, expect } from "vitest";
import {
  ceilDiv,
  amountOut,
  amountIn,
  applyBps,
  subtractBps,
  marginalPrice,
  graduationProgress,
} from "../utils/math.js";
import { BPS } from "../constants.js";

describe("ceilDiv", () => {
  it("divides exactly", () => {
    expect(ceilDiv(10n, 2n)).toBe(5n);
  });

  it("rounds up", () => {
    expect(ceilDiv(10n, 3n)).toBe(4n);
  });

  it("handles zero numerator", () => {
    expect(ceilDiv(0n, 5n)).toBe(0n);
  });

  it("throws on zero divisor", () => {
    expect(() => ceilDiv(10n, 0n)).toThrow("Division by zero");
  });
});

describe("amountOut", () => {
  it("computes constant product output", () => {
    // 1 token in, 100 reserve in, 100 reserve out
    const result = amountOut(1n, 100n, 100n);
    expect(result).toBe(0n); // floor(1 * 100 / 101) = 0
  });

  it("computes larger trades correctly", () => {
    // 10 tokens in, 100 reserve in, 100 reserve out
    const result = amountOut(10n, 100n, 100n);
    // 10 * 100 / 110 = 9.09... → 9
    expect(result).toBe(9n);
  });

  it("returns zero for zero input", () => {
    expect(amountOut(0n, 100n, 100n)).toBe(0n);
  });

  it("returns zero for zero reserves", () => {
    expect(amountOut(10n, 0n, 0n)).toBe(0n);
  });
});

describe("amountIn", () => {
  it("computes required input for desired output", () => {
    // Want 1 token out, 100 reserve in, 100 reserve out
    const result = amountIn(1n, 100n, 100n);
    // (1 * 100) / (100 - 1) + 1 = 100/99 + 1 = 2.01... → 2
    expect(result).toBe(2n);
  });

  it("throws when output exceeds reserve", () => {
    expect(() => amountIn(100n, 100n, 100n)).toThrow("Output exceeds reserve");
  });

  it("returns zero for zero output", () => {
    expect(amountIn(0n, 100n, 100n)).toBe(0n);
  });
});

describe("applyBps", () => {
  it("computes 1% fee", () => {
    expect(applyBps(10000n, 100n)).toBe(100n);
  });

  it("computes 100% fee", () => {
    expect(applyBps(10000n, BPS)).toBe(10000n);
  });

  it("rounds down", () => {
    expect(applyBps(100n, 1n)).toBe(0n); // 100 * 1 / 10000 = 0.01 → 0
  });
});

describe("subtractBps", () => {
  it("subtracts a 1% fee", () => {
    expect(subtractBps(10000n, 100n)).toBe(9900n);
  });

  it("subtracts a 100% fee", () => {
    expect(subtractBps(10000n, BPS)).toBe(0n);
  });
});

describe("marginalPrice", () => {
  it("computes price from reserves", () => {
    expect(marginalPrice(200n, 100n)).toBe(2);
  });

  it("returns 0 for zero token reserve", () => {
    expect(marginalPrice(200n, 0n)).toBe(0);
  });
});

describe("graduationProgress", () => {
  it("computes progress as fraction", () => {
    expect(graduationProgress(50n, 100n)).toBe(0.5);
  });

  it("clamps at 1.0", () => {
    expect(graduationProgress(150n, 100n)).toBe(1);
  });

  it("returns 0 for zero threshold", () => {
    expect(graduationProgress(50n, 0n)).toBe(0);
  });
});
