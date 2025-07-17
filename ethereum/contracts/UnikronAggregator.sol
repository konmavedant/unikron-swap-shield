// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface IUniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256 amountOut);
}

interface IERC20DummyTokenFactory {
    function getDeployedTokens() external view returns (address[] memory);
}

contract UnikronAggregator is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public dummyTokenFactory;
    
    struct DexConfig {
        address router;
        uint8 dexType; // 1: UniswapV2, 2: UniswapV3
        uint24 fee;
        bool enabled;
    }

    mapping(string => DexConfig) public dexConfigs;
    string[] public dexNames;
    mapping(address => bool) public supportedTokens;
    address public treasury;
    uint256 public protocolFeeBps = 10; // 0.1%

    event SwapExecuted(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string dexUsed,
        uint256 feeAmount
    );

    constructor(address _treasury, address _dummyTokenFactory, address _owner) Ownable(_owner) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        dummyTokenFactory = _dummyTokenFactory;
        _initializeSupportedTokens();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _initializeSupportedTokens() private {
        if (dummyTokenFactory != address(0)) {
            address[] memory tokens = IERC20DummyTokenFactory(dummyTokenFactory).getDeployedTokens();
            for (uint i = 0; i < tokens.length; i++) {
                supportedTokens[tokens[i]] = true;
            }
        }
    }

    function addDexConfig(
        string calldata name,
        address router,
        uint8 dexType,
        uint24 fee
    ) external onlyOwner {
        require(router != address(0), "Invalid router address");
        require(dexType == 1 || dexType == 2, "Invalid DEX type");
        
        dexConfigs[name] = DexConfig(router, dexType, fee, true);
        dexNames.push(name);
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        string calldata dexName
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "Token not supported");
        DexConfig memory config = dexConfigs[dexName];
        require(config.enabled, "DEX not enabled");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountOut;
        if (config.dexType == 1) {
            amountOut = _swapV2(tokenIn, tokenOut, amountIn, minAmountOut, config.router);
        } else {
            amountOut = _swapV3(tokenIn, tokenOut, amountIn, minAmountOut, config.router, config.fee);
        }

        uint256 feeAmount = (amountOut * protocolFeeBps) / 10000;
        uint256 userAmount = amountOut - feeAmount;

        IERC20(tokenOut).safeTransfer(msg.sender, userAmount);
        if (feeAmount > 0) {
            IERC20(tokenOut).safeTransfer(treasury, feeAmount);
        }

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, userAmount, dexName, feeAmount);
    }

    function _swapV2(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address router
    ) private returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        IERC20(tokenIn).forceApprove(router, amountIn);
        
        try IUniswapV2Router(router).swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            address(this),
            block.timestamp + 300
        ) returns (uint[] memory amounts) {
            return amounts[1];
        } catch {
            IERC20(tokenIn).safeTransfer(msg.sender, amountIn);
            revert("V2 swap failed");
        }
    }

    function _swapV3(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address router,
        uint24 fee
    ) private returns (uint256) {
        IERC20(tokenIn).forceApprove(router, amountIn);
        
        IUniswapV3Router.ExactInputSingleParams memory params = 
            IUniswapV3Router.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0
            });
            
        try IUniswapV3Router(router).exactInputSingle(params) returns (uint256 amountOut) {
            return amountOut;
        } catch {
            IERC20(tokenIn).safeTransfer(msg.sender, amountIn);
            revert("V3 swap failed");
        }
    }

    // Management Functions
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee too high");
        protocolFeeBps = newFeeBps;
    }

    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasury = newTreasury;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // View Functions
    function getDexNames() external view returns (string[] memory) {
        return dexNames;
    }

    function getSupportedTokens() external view returns (address[] memory) {
        address[] memory factoryTokens = IERC20DummyTokenFactory(dummyTokenFactory).getDeployedTokens();
        address[] memory tokens = new address[](factoryTokens.length);
        for (uint i = 0; i < factoryTokens.length; i++) {
            tokens[i] = factoryTokens[i];
        }
        return tokens;
    }
}