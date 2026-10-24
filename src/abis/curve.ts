import { parseAbi } from "viem";

export const curveAbi = parseAbi([
  // ── Read Functions ───────────────────────────────────────────────────────
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function realQuoteReserve() view returns (uint256)",
  "function sellableTokens() view returns (uint256)",
  "function reservedTokens() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
  "function readyToGraduate() view returns (bool)",
  "function graduated() view returns (bool)",
  "function feeBps() view returns (uint256)",
  "function creatorTaxBps() view returns (uint256)",
  "function buybackEnabled() view returns (bool)",
  "function isNativeQuote() view returns (bool)",
  "function pairToken() view returns (address)",
  "function currentSnipeTaxBps(address recipient) view returns (uint256)",
  "function quoteFeeBalance() view returns (uint256)",
  "function creatorTaxBalance() view returns (uint256)",

  // ── Write Functions ──────────────────────────────────────────────────────
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
  "function sell(uint256 tokensIn, uint256 minQuoteOut, address recipient) returns (uint256 quoteOut)",
  "function sweepFees(uint256 minBuybackTokensOut)",

  // ── Events ───────────────────────────────────────────────────────────────
  "event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)",
  "event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)",
  "event CurveBuyRefunded(address indexed buyer, uint256 refund)",
  "event CurveCompleted(address recipient, uint256 quoteOut, uint256 tokenOut)",
  "event AutoGraduationFailed(address indexed token, uint256 gasRemaining)",
  "event FeesSwept(uint256 protocolAmount, uint256 buybackAmount, uint256 creatorAmount)",
  "event BuybackLocked(uint256 quoteSpent, uint256 tokensLocked)",
]);
