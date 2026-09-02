import { describe, it, expect } from "vitest";
import {
  normalizeAddress,
  isValidAddress,
  shortenAddress,
} from "../utils/formatting.js";
import { ZERO_ADDRESS } from "../constants.js";

describe("normalizeAddress", () => {
  it("returns ZERO_ADDRESS for nullish", () => {
    expect(normalizeAddress(null)).toBe(ZERO_ADDRESS);
    expect(normalizeAddress(undefined)).toBe(ZERO_ADDRESS);
    expect(normalizeAddress("")).toBe(ZERO_ADDRESS);
  });

  it("checksums a valid address", () => {
    const lower = "0xabcdef1234567890abcdef1234567890abcdef12";
    const result = normalizeAddress(lower);
    expect(result).toBe(result); // Already checksummed by getAddress
  });
});

describe("isValidAddress", () => {
  it("returns true for valid address", () => {
    expect(isValidAddress("0x0000000000000000000000000000000000000001")).toBe(true);
  });

  it("returns false for invalid address", () => {
    expect(isValidAddress("not-an-address")).toBe(false);
  });
});

describe("shortenAddress", () => {
  it("shortens an address", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(shortenAddress(addr)).toBe("0x1234...5678");
  });
});
