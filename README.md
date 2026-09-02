# @robhdev/pons-client

TypeScript client for the [Pons v2](https://docs.ponsfamily.com/v2) token launch protocol on Robinhood Chain (4663).

## Install

```bash
npm install @robhdev/pons-client
```

## Setup

```ts
import { createPonsClient } from "@robhdev/pons-client";

// Read-only client
const pons = createPonsClient({ rpcUrl: "https://rpc.robinhood.com" });

// With wallet (for swaps, launches, claims)
const pons = createPonsClient({
  rpcUrl: "https://rpc.robinhood.com",
  wallet: { account, writeContract: walletClient.writeContract },
});
```

## Modules

### factory

List configs, read launches, create tokens.

```ts
const configs = await pons.factory.openLaunchConfigs();
const launch = await pons.factory.getLaunchedToken(token);
const hash = await pons.factory.launchAndBuy(params, configId, pairToken, quoteIn, recipient);
```

### curve

Read state, quote trades, buy/sell on bonding curve.

```ts
const state = await pons.curve.getState(curve);
const quote = await pons.curve.quoteBuy(curve, parseEther("0.01"), recipient);
await pons.curve.buy(curve, quoteIn, minTokensOut, recipient);
await pons.curve.sell(curve, tokensIn, minQuoteOut, recipient);
```

### pool

Build pool keys, read pending fees.

```ts
const poolKey = pons.pool.buildPoolKey(launch);
const poolId = pons.pool.getPoolId(launch);
const fees = await pons.pool.pendingFees(poolId, currency);
```

### fees

Check and claim creator fees.

```ts
const balance = await pons.fees.getBalance(creator);
const erc20 = await pons.fees.getERC20Balance(creator, quoteAsset);
await pons.fees.claim();
await pons.fees.claimToken(quoteAsset);
```

### buyback

Read vesting state, release vested tokens.

```ts
const vesting = await pons.buyback.getState(token);
await pons.buyback.release(token);
```

### events

Index `TokenLaunched`, `CurveBuy`/`CurveSell`, fee sweeps, takeovers.

```ts
const launches = await pons.events.getLaunches(fromBlock);
const trades = await pons.events.getTrades(curve, fromBlock);
const proposals = await pons.events.getTakeoverProposals(fromBlock);
```

### takeover

Check pending creator fee recipient changes.

```ts
const pending = await pons.takeover.getPending(token);
```

### migration

Read migration status, deposit, claim.

```ts
const status = await pons.migration.getStatus(migrationAddress);
await pons.migration.deposit(migrationAddress, amount);
await pons.migration.claim(migrationAddress);
```

## Examples

Copy `.env.example` to `.env` and fill in your values.

| # | Command | Description | Env vars |
|---|---------|-------------|----------|
| 01 | `npx tsx examples/01-read-launch-configs.ts` | List open launch configs | `RPC_URL` |
| 02 | `npx tsx examples/02-launch-token.ts` | Launch a token (atomic) | `RPC_URL`, `PRIVATE_KEY` |
| 03 | `npx tsx examples/03-buy-sell-curve.ts` | Quote trades on curve | `RPC_URL`, `CURVE_ADDRESS` |
| 04 | `npx tsx examples/04-quote-trade.ts` | Local curve math | `RPC_URL`, `CURVE_ADDRESS` |
| 05 | `npx tsx examples/05-track-graduation.ts` | Track graduation progress | `RPC_URL`, `TOKEN_ADDRESS` |
| 06 | `npx tsx examples/06-claim-fees.ts` | Claim creator fees | `RPC_URL`, `PRIVATE_KEY`, `CREATOR_ADDRESS` |
| 07 | `npx tsx examples/07-read-vesting.ts` | Read buyback vesting | `RPC_URL`, `TOKEN_ADDRESS` |
| 08 | `npx tsx examples/08-index-events.ts` | Query historical events | `RPC_URL`, `FROM_BLOCK` |
| 09 | `npx tsx examples/09-pool-swap.ts` | Read pool state | `RPC_URL`, `TOKEN_ADDRESS` |
| 10 | `npx tsx examples/10-get-curve.ts` | Get curve from token | `RPC_URL`, `TOKEN_ADDRESS` |
| 11 | `npx tsx examples/11-swap-curve-buy.ts` | Buy tokens on curve | `RPC_URL`, `PRIVATE_KEY`, `CURVE_ADDRESS`, `BUY_AMOUNT` |
| 12 | `npx tsx examples/12-swap-curve-sell.ts` | Sell tokens to curve | `RPC_URL`, `PRIVATE_KEY`, `CURVE_ADDRESS`, `TOKEN_ADDRESS`, `SELL_AMOUNT` |

## Contract Addresses

Robinhood Chain (4663):

| Contract | Address |
|----------|---------|
| Factory | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| Meme Hook | `0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044` |
| Fee Escrow | `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e` |
| Buyback Vault | `0x42df2a798f82289E177311362e8f5ccC45c1219c` |
| Launch Locker | `0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952` |
| Launch and Buy | `0xe33E9E479dF8802cb0866d5d05258bEc4cF62948` |
| Launch Deployer | `0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42` |
| Graduation Executor | `0xC7819B64A1dAECD7eC19856d026cb14EfBd89046` |
| Graduation Guard | `0xf5695117b99B6f6401e67d4195BD653628176C6C` |

## Development

```bash
npm run build      # build dist/
npm test           # run 49 unit tests
npm run typecheck  # check for type errors
```

## License

MIT
