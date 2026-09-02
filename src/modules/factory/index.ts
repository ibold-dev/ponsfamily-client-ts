import {
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import { factoryAbi } from "../../abis/factory.js";
import { routerAbi } from "../../abis/router.js";
import { ZERO_ADDRESS } from "../../constants.js";
import type {
  FactoryModule,
  LaunchConfig,
  LaunchConfigWithId,
  LaunchedToken,
  PonsWallet,
  TokenParams,
} from "../../types.js";
import {
  requireValidAddress,
  requireValidCreatorTax,
  requireValidExemptions,
} from "../../utils/validation.js";

type ContractAddresses = { factory: Address; launchAndBuy: Address };

export function createFactoryModule(
  publicClient: PublicClient,
  wallet: PonsWallet | undefined,
  addresses: ContractAddresses,
): FactoryModule {
  const read = async <T>(
    functionName: string,
    args?: readonly unknown[],
  ): Promise<T> =>
    publicClient.readContract({
      address: addresses.factory,
      abi: factoryAbi,
      functionName: functionName as never,
      args: args as never,
    }) as Promise<T>;

  const write = async (
    functionName: string,
    args: readonly unknown[],
    value?: bigint,
  ): Promise<`0x${string}`> => {
    if (!wallet)
      throw new Error("Wallet required for write operations");
    const { request } = await publicClient.simulateContract({
      address: addresses.factory,
      abi: factoryAbi,
      functionName: functionName as never,
      args: args as never,
      account: wallet.account!,
      value,
    });
    return wallet.writeContract(request);
  };

  return {
    async openLaunchConfigs(): Promise<LaunchConfigWithId[]> {
      const count = await read<bigint>("launchConfigCount");
      const configs = await Promise.all(
        Array.from({ length: Number(count) }, (_, id) =>
          read<LaunchConfig>("getLaunchConfig", [BigInt(id)]),
        ),
      );
      return configs
        .map(
          (config, id): LaunchConfigWithId => ({
            id: BigInt(id),
            supply: config.supply,
            curveFeeBps: config.curveFeeBps,
            phantomQuote: config.phantomQuote,
            graduationThreshold: config.graduationThreshold,
            poolFee: config.poolFee,
            tickSpacing: config.tickSpacing,
            enabled: config.enabled,
          }),
        )
        .filter((config) => config.enabled);
    },

    async getLaunchConfig(id: bigint): Promise<LaunchConfig> {
      return read<LaunchConfig>("getLaunchConfig", [id]);
    },

    async getLaunchedToken(token: Address): Promise<LaunchedToken> {
      return read<LaunchedToken>("getLaunchedToken", [token]);
    },

    async previewLaunchEconomics(
      configId: bigint,
      pairToken: Address,
    ): Promise<Hex> {
      return read<Hex>("previewLaunchEconomics", [configId, pairToken]);
    },

    async launchFee(): Promise<bigint> {
      return read<bigint>("launchFee");
    },

    async canLaunch(address: Address): Promise<boolean> {
      return read<boolean>("canLaunch", [address]);
    },

    async maxCreatorTaxBps(): Promise<bigint> {
      return read<bigint>("maxCreatorTaxBps");
    },

    async approvedPairTokens(pairToken: Address): Promise<boolean> {
      return read<boolean>("approvedPairTokens", [pairToken]);
    },

    async pairTokenEconomics(
      pairToken: Address,
    ): Promise<{
      phantomQuote: bigint;
      graduationThreshold: bigint;
      decimals: number;
    }> {
      const result = await read<readonly [bigint, bigint, number]>(
        "pairTokenEconomics",
        [pairToken],
      );
      return {
        phantomQuote: result[0],
        graduationThreshold: result[1],
        decimals: Number(result[2]),
      };
    },

    async launchToken(
      params: TokenParams,
      configId: bigint,
      pairToken: Address,
      snipeTaxExemptions: Address[] = [],
    ): Promise<`0x${string}`> {
      requireValidAddress(pairToken, "pairToken");
      requireValidCreatorTax(
        params.creatorTaxBps,
        await this.maxCreatorTaxBps(),
      );
      requireValidExemptions(snipeTaxExemptions);

      const [expectedEconomics, launchFeeAmount] = await Promise.all([
        this.previewLaunchEconomics(configId, pairToken),
        this.launchFee(),
      ]);

      // Pin economics to prevent frontrunning
      const pinnedParams: TokenParams = {
        name: params.name,
        symbol: params.symbol,
        logo: params.logo,
        description: params.description,
        socials: params.socials,
        creatorFeeRecipient: params.creatorFeeRecipient,
        creatorTaxBps: params.creatorTaxBps,
        buybackEnabled: params.buybackEnabled,
        expectedEconomics,
        salt: params.salt,
      };

      if (snipeTaxExemptions.length > 0) {
        return write(
          "launchToken",
          [pinnedParams, configId, pairToken, snipeTaxExemptions],
          pairToken === ZERO_ADDRESS ? launchFeeAmount : launchFeeAmount,
        );
      }

      return write(
        "launchToken",
        [pinnedParams, configId, pairToken],
        pairToken === ZERO_ADDRESS ? launchFeeAmount : launchFeeAmount,
      );
    },

    async launchAndBuy(
      params: TokenParams,
      configId: bigint,
      pairToken: Address,
      quoteIn: bigint,
      minTokensOut: bigint,
      recipient: Address,
      snipeTaxExemptions: Address[] = [],
    ): Promise<{
      hash: `0x${string}`;
      token: Address;
      curve: Address;
      tokensOut: bigint;
    }> {
      requireValidAddress(pairToken, "pairToken");
      requireValidAddress(recipient, "recipient");
      requireValidCreatorTax(
        params.creatorTaxBps,
        await this.maxCreatorTaxBps(),
      );
      requireValidExemptions(snipeTaxExemptions);

      if (!wallet)
        throw new Error("Wallet required for write operations");

      const [expectedEconomics, launchFeeAmount] = await Promise.all([
        this.previewLaunchEconomics(configId, pairToken),
        this.launchFee(),
      ]);

      const pinnedParams: TokenParams = {
        name: params.name,
        symbol: params.symbol,
        logo: params.logo,
        description: params.description,
        socials: params.socials,
        creatorFeeRecipient: params.creatorFeeRecipient,
        creatorTaxBps: params.creatorTaxBps,
        buybackEnabled: params.buybackEnabled,
        expectedEconomics,
        salt: params.salt,
      };

      const value =
        pairToken === ZERO_ADDRESS
          ? launchFeeAmount + quoteIn
          : launchFeeAmount;

      const { request, result } = await publicClient.simulateContract({
        address: addresses.launchAndBuy,
        abi: routerAbi,
        functionName: "launchAndBuy",
        args: [
          pinnedParams,
          configId,
          pairToken,
          quoteIn,
          minTokensOut,
          recipient,
          snipeTaxExemptions,
        ],
        account: wallet.account!,
        value,
      });

      const hash = await wallet.writeContract(request);

      // Parse result to extract token and curve addresses
      const typedResult = result as unknown as readonly [
        Address,
        Address,
        bigint,
      ];

      return {
        hash,
        token: typedResult[0],
        curve: typedResult[1],
        tokensOut: typedResult[2],
      };
    },
  };
}
