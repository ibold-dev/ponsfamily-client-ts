import { parseAbi } from "viem";

export const factoryAbi = parseAbi([
  // ── Structs ──────────────────────────────────────────────────────────────
  "struct LaunchConfig { uint256 supply; uint256 curveFeeBps; uint256 phantomQuote; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; bool enabled; }",
  "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
  "struct TokenParams { string name; string symbol; string logo; string description; Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps; bool buybackEnabled; bytes32 expectedEconomics; bytes32 salt; }",
  "struct LaunchedToken { address token; address curve; address deployer; address creatorFeeRecipient; address pairToken; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; uint16 creatorTaxBps; bool buybackEnabled; uint8 phase; uint256 sweptQuote; uint256 sweptTokens; uint256 sweptAt; bool exists; }",
  "struct FeePolicy { address protocolFeeRecipient; uint16 protocolFeeShareBps; uint16 buybackBurnBps; uint16 hookFeeBps; uint16 maxInternalPriceImpactBps; }",

  // ── Read Functions ───────────────────────────────────────────────────────
  "function launchConfigCount() view returns (uint256)",
  "function getLaunchConfig(uint256 id) view returns (LaunchConfig)",
  "function getLaunchedToken(address token) view returns (LaunchedToken)",
  "function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)",
  "function launchFee() view returns (uint256)",
  "function canLaunch(address launcher) view returns (bool)",
  "function maxCreatorTaxBps() view returns (uint16)",
  "function approvedPairTokens(address pairToken) view returns (bool)",
  "function pairTokenEconomics(address pairToken) view returns (uint256 phantomQuote, uint256 graduationThreshold, uint8 decimals)",
  "function getLaunchFeePolicy(address token) view returns (FeePolicy)",
  "function pendingCreatorFeeRecipient(address token) view returns (address recipient, uint256 effectiveAt, uint256 expiresAt)",

  // ── Write Functions ──────────────────────────────────────────────────────
  "function launchToken(TokenParams params, uint256 launchConfigId, address pairToken) payable returns (address token, address curve)",
  "function launchToken(TokenParams params, uint256 launchConfigId, address pairToken, address[] snipeTaxExemptions) payable returns (address token, address curve)",
  "function createGraduatedPool(address token)",
  "function transferCreatorFeeRecipient(address token, address newRecipient)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)",
  "event LaunchSwept(address indexed token, uint256 sweptQuote, uint256 sweptTokens)",
  "event PoolGraduated(address indexed token, address indexed pool)",
  "event CreatorFeeRecipientChangeProposed(address indexed token, address indexed newRecipient, uint256 effectiveAt)",
  "event CreatorFeeRecipientUpdated(address indexed token, address indexed oldRecipient, address indexed newRecipient)",
]);
