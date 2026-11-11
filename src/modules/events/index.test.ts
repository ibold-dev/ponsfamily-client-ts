import { describe, it, expect } from "vitest";
import type { Address, PublicClient } from "viem";
import { createEventsModule } from "./index.js";
import type { EventsModule } from "../../types.js";

const FACTORY = "0x1111111111111111111111111111111111111111" as Address;
const HOOK = "0x2222222222222222222222222222222222222222" as Address;
const CURVE = "0x3333333333333333333333333333333333333333" as Address;
const ADDR_A = "0x00000000000000000000000000000000000000aa" as Address;
const ADDR_B = "0x00000000000000000000000000000000000000bb" as Address;
const ADDR_C = "0x00000000000000000000000000000000000000cc" as Address;
const POOL_ID = `0x${"ab".repeat(32)}` as `0x${string}`;

type FakeLog = {
  address: Address;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  eventName: string;
  args: Record<string, unknown>;
};

type GetLogsParams = {
  address: Address;
  event?: { name: string };
  events?: { name: string }[];
  fromBlock: bigint | "latest";
  toBlock: bigint | "latest";
};

function txHash(n: bigint): `0x${string}` {
  return `0x${n.toString(16).padStart(64, "0")}`;
}

function makeClient(opts: {
  logs: FakeLog[];
  head?: bigint | (() => bigint);
  headError?: Error;
  failOnCall?: { index: number; error: Error };
}) {
  const logCalls: GetLogsParams[] = [];
  const headCalls: unknown[] = [];
  const client = {
    async getBlockNumber(args?: unknown) {
      headCalls.push(args);
      if (opts.headError) throw opts.headError;
      const h = opts.head ?? 0n;
      return typeof h === "function" ? h() : h;
    },
    async getLogs(params: GetLogsParams) {
      logCalls.push(params);
      if (opts.failOnCall && logCalls.length - 1 === opts.failOnCall.index) {
        throw opts.failOnCall.error;
      }
      const from = params.fromBlock as bigint;
      const to = params.toBlock as bigint;
      return opts.logs.filter(
        (l) => l.address === params.address && l.blockNumber >= from && l.blockNumber <= to,
      );
    },
  };
  return { client: client as unknown as PublicClient, logCalls, headCalls };
}

type Helper = {
  name: string;
  address: Address;
  eventNames: string[];
  makeLog(block: bigint): FakeLog;
  call(
    m: EventsModule,
    from: bigint,
    to?: bigint | "latest",
    opts?: { chunkSize?: bigint },
  ): Promise<unknown[]>;
  expectMapped(result: unknown, block: bigint): void;
};

const helpers: Helper[] = [
  {
    name: "getLaunches",
    address: FACTORY,
    eventNames: ["TokenLaunched"],
    makeLog: (block) => ({
      address: FACTORY,
      blockNumber: block,
      transactionHash: txHash(block),
      eventName: "TokenLaunched",
      args: {
        token: ADDR_A,
        curve: ADDR_B,
        deployer: ADDR_C,
        pairToken: ADDR_A,
        launchConfigId: 7n,
        graduationThreshold: 99n,
      },
    }),
    call: (m, from, to, opts) =>
      to === undefined ? m.getLaunches(from) : m.getLaunches(from, to, opts),
    expectMapped: (r, block) =>
      expect(r).toEqual({
        token: ADDR_A,
        curve: ADDR_B,
        deployer: ADDR_C,
        pairToken: ADDR_A,
        launchConfigId: 7n,
        graduationThreshold: 99n,
        blockNumber: block,
        transactionHash: txHash(block),
      }),
  },
  {
    name: "getTrades",
    address: CURVE,
    eventNames: ["CurveBuy", "CurveSell"],
    makeLog: (block) =>
      block % 2n === 0n
        ? {
            address: CURVE,
            blockNumber: block,
            transactionHash: txHash(block),
            eventName: "CurveBuy",
            args: {
              buyer: ADDR_A,
              recipient: ADDR_B,
              quoteIn: 1n,
              tokensOut: 2n,
              fee: 3n,
              tax: 4n,
            },
          }
        : {
            address: CURVE,
            blockNumber: block,
            transactionHash: txHash(block),
            eventName: "CurveSell",
            args: {
              seller: ADDR_C,
              recipient: ADDR_B,
              tokensIn: 5n,
              quoteOut: 6n,
              fee: 7n,
              tax: 8n,
            },
          },
    call: (m, from, to, opts) =>
      to === undefined ? m.getTrades(CURVE, from) : m.getTrades(CURVE, from, to, opts),
    expectMapped: (r, block) =>
      expect(r).toEqual(
        block % 2n === 0n
          ? {
              type: "buy",
              buyer: ADDR_A,
              recipient: ADDR_B,
              quoteIn: 1n,
              tokensOut: 2n,
              fee: 3n,
              tax: 4n,
              blockNumber: block,
              transactionHash: txHash(block),
            }
          : {
              type: "sell",
              seller: ADDR_C,
              recipient: ADDR_B,
              tokensIn: 5n,
              quoteOut: 6n,
              fee: 7n,
              tax: 8n,
              blockNumber: block,
              transactionHash: txHash(block),
            },
      ),
  },
  {
    name: "getFeeSweeps",
    address: HOOK,
    eventNames: ["PoolFeesSwept"],
    makeLog: (block) => ({
      address: HOOK,
      blockNumber: block,
      transactionHash: txHash(block),
      eventName: "PoolFeesSwept",
      args: {
        poolId: POOL_ID,
        protocolAmount: 1n,
        buybackAmount: 2n,
        creatorAmount: 3n,
        tokensLocked: 4n,
      },
    }),
    call: (m, from, to, opts) =>
      to === undefined ? m.getFeeSweeps(HOOK, from) : m.getFeeSweeps(HOOK, from, to, opts),
    expectMapped: (r, block) =>
      expect(r).toEqual({
        poolId: POOL_ID,
        protocolAmount: 1n,
        buybackAmount: 2n,
        creatorAmount: 3n,
        tokensLocked: 4n,
        blockNumber: block,
        transactionHash: txHash(block),
      }),
  },
  {
    name: "getTakeoverProposals",
    address: FACTORY,
    eventNames: ["CreatorFeeRecipientChangeProposed"],
    makeLog: (block) => ({
      address: FACTORY,
      blockNumber: block,
      transactionHash: txHash(block),
      eventName: "CreatorFeeRecipientChangeProposed",
      args: {
        token: ADDR_A,
        currentRecipient: ADDR_B,
        newRecipient: ADDR_C,
        effectiveAt: 10n,
        expiresAt: 20n,
      },
    }),
    call: (m, from, to, opts) =>
      to === undefined ? m.getTakeoverProposals(from) : m.getTakeoverProposals(from, to, opts),
    expectMapped: (r, block) =>
      expect(r).toEqual({
        token: ADDR_A,
        currentRecipient: ADDR_B,
        newRecipient: ADDR_C,
        effectiveAt: 10n,
        expiresAt: 20n,
        blockNumber: block,
        transactionHash: txHash(block),
      }),
  },
];

function ranges(calls: GetLogsParams[]): [bigint, bigint][] {
  return calls.map((c) => [c.fromBlock as bigint, c.toBlock as bigint]);
}

describe.each(helpers)("events.$name", (h) => {
  const setup = (o: Parameters<typeof makeClient>[0]) => {
    const fake = makeClient(o);
    const module = createEventsModule(fake.client, { factory: FACTORY, memeHook: HOOK });
    return { ...fake, module };
  };

  it("forwards address and event filters and maps fields", async () => {
    const { module, logCalls } = setup({ logs: [h.makeLog(5n), h.makeLog(6n)], head: 10n });
    const result = await h.call(module, 0n, "latest");
    expect(logCalls).toHaveLength(1);
    expect(logCalls[0].address).toBe(h.address);
    const names = (logCalls[0].events ?? [logCalls[0].event!]).map((e) => e.name);
    expect(names).toEqual(h.eventNames);
    expect(result).toHaveLength(2);
    h.expectMapped(result[0], 5n);
    h.expectMapped(result[1], 6n);
  });

  it("splits with the default 100000-block chunk size at the exact inclusive boundary", async () => {
    const { module, logCalls } = setup({ logs: [], head: 0n });
    await h.call(module, 1n, 250_000n);
    expect(ranges(logCalls)).toEqual([
      [1n, 100_000n],
      [100_001n, 200_000n],
      [200_001n, 250_000n],
    ]);
  });

  it("uses a single request when the range is exactly one chunk", async () => {
    const { module, logCalls } = setup({ logs: [], head: 0n });
    await h.call(module, 0n, 99_999n);
    expect(ranges(logCalls)).toEqual([[0n, 99_999n]]);
    logCalls.length = 0;
    await h.call(module, 0n, 100_000n);
    expect(ranges(logCalls)).toEqual([
      [0n, 99_999n],
      [100_000n, 100_000n],
    ]);
  });

  it("supports chunkSize 1 and keeps logs in block order", async () => {
    const { module, logCalls } = setup({
      logs: [h.makeLog(2n), h.makeLog(3n), h.makeLog(3n), h.makeLog(4n)],
    });
    const result = await h.call(module, 2n, 4n, { chunkSize: 1n });
    expect(ranges(logCalls)).toEqual([
      [2n, 2n],
      [3n, 3n],
      [4n, 4n],
    ]);
    expect(result).toHaveLength(4);
    h.expectMapped(result[0], 2n);
    h.expectMapped(result[1], 3n);
    h.expectMapped(result[2], 3n);
    h.expectMapped(result[3], 4n);
  });

  it("handles bigint values beyond Number.MAX_SAFE_INTEGER", async () => {
    const from = 2n ** 70n;
    const { module, logCalls } = setup({ logs: [h.makeLog(from + 5n)] });
    const result = await h.call(module, from, from + 9n, { chunkSize: 4n });
    expect(ranges(logCalls)).toEqual([
      [from, from + 3n],
      [from + 4n, from + 7n],
      [from + 8n, from + 9n],
    ]);
    expect(result).toHaveLength(1);
    h.expectMapped(result[0], from + 5n);
  });

  it("resolves latest exactly once, even if the head moves", async () => {
    let head = 9n;
    const { module, logCalls, headCalls } = setup({
      logs: [],
      head: () => head++,
    });
    await h.call(module, 0n, "latest", { chunkSize: 3n });
    expect(headCalls).toEqual([{ cacheTime: 0 }]);
    expect(ranges(logCalls)).toEqual([
      [0n, 2n],
      [3n, 5n],
      [6n, 8n],
      [9n, 9n],
    ]);
  });

  it("omitting toBlock resolves latest", async () => {
    const { module, logCalls, headCalls } = setup({ logs: [], head: 4n });
    await h.call(module, 0n);
    expect(headCalls).toHaveLength(1);
    expect(ranges(logCalls)).toEqual([[0n, 4n]]);
  });

  it("does not read the head for an explicit numeric bound", async () => {
    const { module, headCalls } = setup({ logs: [], head: 4n });
    await h.call(module, 0n, 10n);
    expect(headCalls).toHaveLength(0);
  });

  it("returns [] without getLogs when from > explicit to", async () => {
    const { module, logCalls } = setup({ logs: [h.makeLog(5n)], head: 100n });
    expect(await h.call(module, 10n, 9n)).toEqual([]);
    expect(logCalls).toHaveLength(0);
  });

  it("returns [] without getLogs when from > resolved latest", async () => {
    const { module, logCalls, headCalls } = setup({ logs: [], head: 5n });
    expect(await h.call(module, 6n, "latest")).toEqual([]);
    expect(headCalls).toHaveLength(1);
    expect(logCalls).toHaveLength(0);
  });

  it.each([0n, -1n, -100_000n])(
    "rejects chunkSize %s with RangeError before any RPC",
    async (c) => {
      const { module, logCalls, headCalls } = setup({ logs: [], head: 5n });
      await expect(h.call(module, 0n, "latest", { chunkSize: c })).rejects.toBeInstanceOf(
        RangeError,
      );
      await expect(h.call(module, 0n, 5n, { chunkSize: c })).rejects.toBeInstanceOf(RangeError);
      expect(logCalls).toHaveLength(0);
      expect(headCalls).toHaveLength(0);
    },
  );

  it("propagates a getBlockNumber rejection unchanged and sends no getLogs", async () => {
    const err = new Error("head failed");
    const { module, logCalls } = setup({ logs: [], headError: err });
    await expect(h.call(module, 0n, "latest")).rejects.toBe(err);
    expect(logCalls).toHaveLength(0);
  });

  it("rejects with the identical error on a middle chunk and sends no later chunk", async () => {
    const err = new Error("rpc boom");
    const { module, logCalls } = setup({
      logs: [h.makeLog(1n)],
      failOnCall: { index: 1, error: err },
    });
    await expect(h.call(module, 0n, 9n, { chunkSize: 2n })).rejects.toBe(err);
    expect(ranges(logCalls)).toEqual([
      [0n, 1n],
      [2n, 3n],
    ]);
  });
});

describe("events dense single chunk", () => {
  it("returns every log of a single chunk holding 150000 logs, in order", async () => {
    const count = 150_000;
    const logs: FakeLog[] = Array.from({ length: count }, (_, i) => ({
      ...helpers[0].makeLog(42n),
      transactionHash: txHash(BigInt(i)),
    }));
    const { client } = makeClient({ logs });
    const module = createEventsModule(client, { factory: FACTORY, memeHook: HOOK });
    const result = await module.getLaunches(42n, 42n);
    expect(result).toHaveLength(count);
    expect(result[0].transactionHash).toBe(txHash(0n));
    expect(result[count - 1].transactionHash).toBe(txHash(BigInt(count - 1)));
    expect(result.every((e, i) => e.transactionHash === txHash(BigInt(i)))).toBe(true);
  });
});
