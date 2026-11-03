import { describe, expect, it, vi } from "vitest";
import type { PublicClient } from "viem";
import { createFactoryModule } from "./index.js";

const addresses = {
  factory: "0x0000000000000000000000000000000000000001",
  launchAndBuy: "0x0000000000000000000000000000000000000002",
} as const;

describe("factory snipe tax configuration", () => {
  it("reads the current values from the selected factory", async () => {
    const readContract = vi.fn().mockResolvedValueOnce(9900n).mockResolvedValueOnce(3n);
    const client = createFactoryModule(
      { readContract } as unknown as PublicClient,
      undefined,
      addresses,
    );

    await expect(client.snipeTaxStartBps()).resolves.toBe(9900n);
    await expect(client.snipeTaxSeconds()).resolves.toBe(3n);
    expect(readContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        address: addresses.factory,
        functionName: "snipeTaxStartBps",
      }),
    );
    expect(readContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        address: addresses.factory,
        functionName: "snipeTaxSeconds",
      }),
    );
  });
});
