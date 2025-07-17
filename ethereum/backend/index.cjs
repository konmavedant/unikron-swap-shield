const express = require('express');
const cors = require('cors');
const { ethers, JsonRpcProvider } = require('ethers'); // ✅ import JsonRpcProvider
const config = require('./config.cjs');

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider(config.infura.url);


const signer = new ethers.Wallet(config.privateKey, provider);

const aggregator = new ethers.Contract(
  config.aggregatorAddress,
  config.swapContractAbi,
  signer
);

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

const DUMMY_PRICES = {
  'ETH-D/USDT-D': 2000,
  'USDT-D/ETH-D': 1 / 2000,
  'ETH-D/DAI-D': 2000,
  'DAI-D/ETH-D': 1 / 2000,
  'ETH-D/UNI-D': 100,
  'UNI-D/ETH-D': 1 / 100,
  'LINK-D/ETH-D': 100,
  'ETH-D/LINK-D': 1 / 100,
  'ETH-D/USDC-D': 2000,
  'USDC-D/ETH-D': 1 / 2000,
};

app.get('/tokens', async (req, res) => {
  try {
    const tokens = await Promise.all(config.tokens.map(async (t) => {
      let { address, symbol, name, decimals } = t;
      try {
        const token = new ethers.Contract(address, ERC20_ABI, provider);
        if (!decimals) decimals = await token.decimals();
        if (!symbol) symbol = await token.symbol();
        if (!name) name = await token.name();
      } catch (err) {
        // ignore fetch errors and fallback to config
      }
      return { ...t, address, symbol, name, decimals };
    }));
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/quote', async (req, res) => {
  const { fromToken, toToken, amount } = req.query;
  if (!fromToken || !toToken || !amount) return res.status(400).json({ error: 'Missing params' });
  if (fromToken === toToken) return res.status(400).json({ error: 'Cannot swap same token' });

  const from = config.tokens.find(t => t.address.toLowerCase() === fromToken.toLowerCase());
  const to = config.tokens.find(t => t.address.toLowerCase() === toToken.toLowerCase());
  if (!from || !to) return res.status(400).json({ error: 'Invalid token address' });

  const pair = `${from.symbol}/${to.symbol}`;
  let price = DUMMY_PRICES[pair] || 1;

  const fromAmount = parseFloat(amount);
  const toAmount = (fromAmount * price).toString();

  res.json({
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount,
    price,
    route: [from.symbol, to.symbol],
    minOutputAmount: toAmount,
    slippage: 0.5,
    quoteId: Date.now().toString(),
    validUntil: Date.now() + 60000,
  });
});

app.post('/swap/commit', async (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Missing hash' });
  try {
    const tx = await aggregator.commitSwap(hash);
    await tx.wait();
    res.json({ status: 'committed', txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/swap/reveal', async (req, res) => {
  const { tokenIn, tokenOut, amountIn, nonce, permitV, permitR, permitS } = req.body;
  if (!tokenIn || !tokenOut || !amountIn || !nonce) return res.status(400).json({ error: 'Missing params' });
  try {
    const tx = await aggregator.revealSwap(tokenIn, tokenOut, amountIn, nonce, permitV || 0, permitR || ethers.ZeroHash, permitS || ethers.ZeroHash);
    await tx.wait();
    res.json({ status: 'revealed', txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/deployed-tokens', async (req, res) => {
  try {
    const tokens = await aggregator.getDeployedTokens();
    res.json({ tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/swap/status', async (req, res) => {
  const { txHash } = req.query;
  if (!txHash) return res.status(400).json({ error: 'Missing txHash' });
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) return res.json({ status: 'pending' });
    res.json({ status: receipt.status === 1 ? 'success' : 'failed', receipt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Ethereum backend running on port ${PORT}`));
