import { utils } from 'ethers';

export function getCommitHash(tokenIn: string, tokenOut: string, amountIn: string, nonce: string) {
  return utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['address', 'address', 'uint256', 'uint256'],
      [tokenIn, tokenOut, amountIn, nonce]
    )
  );
} 