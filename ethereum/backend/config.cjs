module.exports = {
  tokens: [
    { name: 'Dummy Ethereum', symbol: 'ETH-D', address: '0x014c66bFe06949F45304B23bD7CbFFCFD845bC42' },
    { name: 'Dummy Tether', symbol: 'USDT-D', address: '0x947092F0eEF063FF8db69D3eDe4994927772DfA8' },
    { name: 'Dai Stablecoin', symbol: 'DAI-D', address: '0x19894273C95e4e7aA96f8500fe50cB8aE8A6991C' },
    { name: 'Uniswap Dummy', symbol: 'UNI-D', address: '0xe6DD30e98D3C591Ec55C04a24e2b98ab52F764A9' },
    { name: 'Chainlink Dummy', symbol: 'LINK-D', address: '0xDBb66CA34B8A08441Be493aC305b0bdFCa4169cD' },
    { name: 'Aave Dummy', symbol: 'AAVE-D', address: '0xBC1e9AC6015C1295Af3e1987c664Cd052e3C38B7' },
    { name: 'Polygon Dummy', symbol: 'MATIC-D', address: '0x524B569aF737F977BdaaEC42dD24e74f0916033c' },
    { name: 'BND Dummy', symbol: 'BNB-D', address: '0x1d5AFD87B505b2BEf6aAbe987b461Ab56D5a8834' },
    { name: 'Solana Dummy', symbol: 'SOL-D', address: '0xa9E2D3fA8476C7873fb7424bd9BA2a301BCD119c' },
  ],

  swapContract: '0x1a3655e14e8c5736ffac297dfd1fc324f90eedde',

  swapContractAbi: [
    {
      "inputs": [],
      "name": "getDeployedTokens",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],

  dummyTokenAbi: [
    { "inputs": [
        { "internalType": "string", "name": "name_", "type": "string" },
        { "internalType": "string", "name": "symbol_", "type": "string" },
        { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
        { "internalType": "address", "name": "_owner", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    { "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "allowance", "type": "uint256" },
        { "internalType": "uint256", "name": "needed", "type": "uint256" }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    { "inputs": [
        { "internalType": "address", "name": "sender", "type": "address" },
        { "internalType": "uint256", "name": "balance", "type": "uint256" },
        { "internalType": "uint256", "name": "needed", "type": "uint256" }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "approver", "type": "address" }],
      "name": "ERC20InvalidApprover", "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }],
      "name": "ERC20InvalidReceiver", "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }],
      "name": "ERC20InvalidSender", "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }],
      "name": "ERC20InvalidSpender", "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "OwnableInvalidOwner", "type": "error"
    },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "OwnableUnauthorizedAccount", "type": "error"
    },
    { "anonymous": false, "inputs": [
        { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Approval", "type": "event"
    },
    { "anonymous": false, "inputs": [
        { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "OwnershipTransferred", "type": "event"
    },
    { "anonymous": false, "inputs": [
        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Transfer", "type": "event"
    },
    { "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" }
      ],
      "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view", "type": "function"
    },
    { "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
      "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }
  ],

  dummyTokenAddress: '0x97CC79E2AF351281ae5E8581316A6EBfC07E46D9',

  infura: {
    projectId: '1aef165fe6af4f72a23ba224f3d440a4',
    url: 'https://sepolia.infura.io/v3/1aef165fe6af4f72a23ba224f3d440a4',
  },

  privateKey: '5c95e52bf8a5eb0bb1d6da236bd865c93720048d1c99279ed8e2ee440e3fd9ce',

  aggregatorAddress: '0x1a3655e14e8c5736ffac297dfd1fc324f90eedde',

  factoryAddress: '0x97CC79E2AF351281ae5E8581316A6EBfC07E46D9',
};
