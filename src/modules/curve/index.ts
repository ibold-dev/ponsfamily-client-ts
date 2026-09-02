import {
  type Address,
  type PublicClient,
  decodeEventLog,
} from "viem";
import { curveAbi } from "../../abis/curve.js";
import { BPS } from "../../constants.js";
import type {
  BuyQuote,
  BuyResult,
  CurveReserves,
  CurveState,
  CurveModule,
  PonsWallet,
  SellQuote,
  SellResult,
} from "../../types.js";
import { ceilDiv, amountOut, amountIn } from "../../utils/math.js";

type ContractAddresses = Record<string, Address>;

export function createCurveModule(
  publicClient: PublicClient,
  wallet: PonsWallet | undefined,
  _addresses: ContractAddresses,
): CurveModule {
  const read = async <T>(
    contractAddress: Address,
    functionName: string,
    args?: readonly unknown[],
  ): Promise<T> =>
    publicClient.readContract({
      address: contractAddress,
      abi: curveAbi,
      functionName: functionName as never,
      args: args as never,
    }) as Promise<T>;

  const write = async (
    contractAddress: Address,
    functionName: string,
    args: readonly unknown[],
    value?: bigint,
  ): Promise<`0x${string}`> => {
    if (!wallet)
      throw new Error("Wallet required for write operations");
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: curveAbi,
      functionName: functionName as never,
      args: args as never,
      account: wallet.account!,
      value,
    });
    return wallet.writeContract(request);
  };

  return {
    async buy(
      curve: Address,
      quoteIn: bigint,
      minTokensOut: bigint,
      recipient: Address,
      value?: bigint,
    ): Promise<BuyResult> {
      const isNative = await read<boolean>(curve, "isNativeQuote");
      const sendValue = isNative ? quoteIn : (value ?? 0n);

      const hash = await write(
        curve,
        "buy",
        [quoteIn, minTokensOut, recipient],
        sendValue,
      );

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let tokensOut = 0n;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: curveAbi,
            eventName: "CurveBuy",
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "CurveBuy") {
            tokensOut = decoded.args.tokensOut;
            break;
          }
        } catch {
          // Not our event, continue
        }
      }

      return { tokensOut, hash };
    },

    async sell(
      curve: Address,
      tokensIn: bigint,
      minQuoteOut: bigint,
      recipient: Address,
    ): Promise<SellResult> {
      const hash = await write(curve, "sell", [
        tokensIn,
        minQuoteOut,
        recipient,
      ]);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let quoteOut = 0n;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: curveAbi,
            eventName: "CurveSell",
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "CurveSell") {
            quoteOut = decoded.args.quoteOut;
            break;
          }
        } catch {
          // Not our event, continue
        }
      }

      return { quoteOut, hash };
    },

    async quoteBuy(
      curve: Address,
      quoteIn: bigint,
      recipient: Address,
    ): Promise<BuyQuote> {
      const results = await Promise.all([
        read<readonly [bigint, bigint]>(curve, "getReserves"),
        read<bigint>(curve, "sellableTokens"),
        read<bigint>(curve, "feeBps"),
        read<bigint>(curve, "creatorTaxBps"),
        read<bigint>(curve, "currentSnipeTaxBps", [recipient]),
      ]);

      const reserves = results[0];
      const sellable = results[1];
      const feeBps = results[2];
      const creatorTaxBps = results[3];
      const rawSnipeBps = results[4];

      const quoteReserve = reserves[0];
      const tokenReserve = reserves[1];

      // Cap snipe tax so buyer always nets at least 1% of spend
      let snipeBps = rawSnipeBps;
      if (snipeBps > 0n) {
        const maxSnipeBps = BPS - feeBps - creatorTaxBps - 100n;
        if (snipeBps > maxSnipeBps) snipeBps = maxSnipeBps;
      }

      // Deduct all fees before pricing
      let spent = quoteIn;
      const fee = (spent * feeBps) / BPS;
      const tax = (spent * creatorTaxBps) / BPS;
      const snipeTax = (spent * snipeBps) / BPS;
      let tokensOut = amountOut(
        spent - fee - tax - snipeTax,
        quoteReserve,
        tokenReserve,
      );

      // Clamp to sellable and refund excess
      if (tokensOut > sellable) {
        tokensOut = sellable;
        const net = amountIn(sellable, quoteReserve, tokenReserve);
        const totalBps = BPS - feeBps - creatorTaxBps - snipeBps;
        if (totalBps <= 0n) {
          // Fees consume entire input — return full amount as refund
          return { tokensOut, spent: 0n, refund: quoteIn };
        }
        const grossed = ceilDiv((net * BPS), totalBps);
        spent = grossed < quoteIn ? grossed : quoteIn;
      }

      return { tokensOut, spent, refund: quoteIn - spent };
    },

    async quoteSell(curve: Address, tokensIn: bigint): Promise<SellQuote> {
      const results = await Promise.all([
        read<readonly [bigint, bigint]>(curve, "getReserves"),
        read<bigint>(curve, "feeBps"),
        read<bigint>(curve, "creatorTaxBps"),
      ]);

      const reserves = results[0];
      const feeBps = results[1];
      const creatorTaxBps = results[2];

      const quoteReserve = reserves[0];
      const tokenReserve = reserves[1];

      // Price first, then deduct fees from output
      const gross = amountOut(tokensIn, tokenReserve, quoteReserve);
      const fee = (gross * feeBps) / BPS;
      const tax = (gross * creatorTaxBps) / BPS;
      return { quoteOut: gross - fee - tax };
    },

    async getState(curve: Address): Promise<CurveState> {
      const reserves = await read<readonly [bigint, bigint]>(
        curve,
        "getReserves",
      );
      const [
        realQuoteReserve,
        sellableTokens,
        graduationThreshold,
        readyToGraduate,
        graduated,
        feeBps,
        creatorTaxBps,
        buybackEnabled,
        isNativeQuote,
        pairToken,
      ] = await Promise.all([
        read<bigint>(curve, "realQuoteReserve"),
        read<bigint>(curve, "sellableTokens"),
        read<bigint>(curve, "graduationThreshold"),
        read<boolean>(curve, "readyToGraduate"),
        read<boolean>(curve, "graduated"),
        read<bigint>(curve, "feeBps"),
        read<bigint>(curve, "creatorTaxBps"),
        read<boolean>(curve, "buybackEnabled"),
        read<boolean>(curve, "isNativeQuote"),
        read<Address>(curve, "pairToken"),
      ]);

      return {
        reserves: {
          quoteReserve: reserves[0],
          tokenReserve: reserves[1],
        },
        realQuoteReserve,
        sellableTokens,
        graduationThreshold,
        readyToGraduate,
        graduated,
        feeBps,
        creatorTaxBps,
        buybackEnabled,
        isNativeQuote,
        pairToken,
      };
    },

    async getReserves(curve: Address): Promise<CurveReserves> {
      const reserves = await read<readonly [bigint, bigint]>(
        curve,
        "getReserves",
      );
      return { quoteReserve: reserves[0], tokenReserve: reserves[1] };
    },

    async sellableTokens(curve: Address): Promise<bigint> {
      return read<bigint>(curve, "sellableTokens");
    },

    async readyToGraduate(curve: Address): Promise<boolean> {
      return read<boolean>(curve, "readyToGraduate");
    },

    async currentSnipeTaxBps(
      curve: Address,
      recipient: Address,
    ): Promise<bigint> {
      return read<bigint>(curve, "currentSnipeTaxBps", [recipient]);
    },
  };
}
