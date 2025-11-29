// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ReciclaToken.sol";

/**
 * @title ReciclaICO
 * @dev Contrato de ICO para la venta de tokens REC
 */
contract ReciclaICO is Ownable, ReentrancyGuard, Pausable {
    // STATE VARIABLES
    ReciclaToken public token;

    uint256 public tokenPrice;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public minPurchase;
    uint256 public maxPurchase;

    uint256 public totalRaised;
    uint256 public totalTokensSold;
    bool public icoFinalized;
    bool public softCapReached;

    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokensPurchased;
    address[] public contributors;
    mapping(uint256 => uint256) public weeklyDiscounts;

    // EVENTS
    event TokensPurchased(
        address indexed buyer,
        uint256 maticAmount,
        uint256 tokenAmount,
        uint256 discountApplied
    );
    event ICOStarted(uint256 startTime, uint256 endTime);
    event ICOFinalized(
        uint256 totalRaised,
        uint256 totalTokensSold,
        bool softCapReached
    );
    event RefundClaimed(address indexed buyer, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);

    // CONSTRUCTOR
    constructor(
        address _tokenAddress,
        uint256 _tokenPrice,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) Ownable(msg.sender) {
        require(
            _tokenAddress != address(0),
            "ReciclaICO: Token address cannot be zero"
        );
        require(
            _tokenPrice > 0,
            "ReciclaICO: Token price must be greater than zero"
        );
        require(
            _softCap > 0 && _hardCap > _softCap,
            "ReciclaICO: Invalid cap configuration"
        );
        require(
            _minPurchase > 0 && _maxPurchase >= _minPurchase,
            "ReciclaICO: Invalid purchase limits"
        );

        token = ReciclaToken(_tokenAddress);
        tokenPrice = _tokenPrice;
        softCap = _softCap;
        hardCap = _hardCap;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;

        weeklyDiscounts[1] = 15;
        weeklyDiscounts[2] = 10;
        weeklyDiscounts[3] = 5;
    }

    // MAIN FUNCTIONS
    function startICO(uint256 duration) external onlyOwner {
        require(startTime == 0, "ReciclaICO: ICO already started");
        require(duration > 0, "ReciclaICO: Duration must be greater than zero");

        startTime = block.timestamp;
        endTime = block.timestamp + duration;

        emit ICOStarted(startTime, endTime);
    }
    function buyTokens() external payable nonReentrant whenNotPaused {
        require(isICOActive(), "ReciclaICO: ICO is not active");
        require(msg.value > 0, "ReciclaICO: Must send MATIC");
        require(
            totalRaised + msg.value <= hardCap,
            "ReciclaICO: Hard cap would be exceeded"
        );

        // Calcular cantidad de tokens sin descuento
        uint256 tokensWithoutDiscount = (msg.value * 10 ** 18) / tokenPrice;

        // Aplicar descuento según la semana
        uint256 discount = getCurrentDiscount();
        uint256 bonusTokens = (tokensWithoutDiscount * discount) / 100;
        uint256 totalTokens = tokensWithoutDiscount + bonusTokens;

        // Validar límites de compra
        uint256 newTotalPurchased = tokensPurchased[msg.sender] + totalTokens;
        require(
            newTotalPurchased >= minPurchase,
            "ReciclaICO: Below minimum purchase"
        );
        require(
            newTotalPurchased <= maxPurchase,
            "ReciclaICO: Exceeds maximum purchase"
        );

        // Verificar que hay suficientes tokens disponibles
        require(
            token.balanceOf(address(this)) >= totalTokens,
            "ReciclaICO: Insufficient tokens in contract"
        );

        // Actualizar estado
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }

        contributions[msg.sender] += msg.value;
        tokensPurchased[msg.sender] += totalTokens;
        totalRaised += msg.value;
        totalTokensSold += totalTokens;

        // Verificar si se alcanzó el soft cap
        if (!softCapReached && totalRaised >= softCap) {
            softCapReached = true;
        }

        // Transferir tokens al comprador
        require(
            token.transfer(msg.sender, totalTokens),
            "ReciclaICO: Token transfer failed"
        );

        emit TokensPurchased(msg.sender, msg.value, totalTokens, discount);
    }
    function finalizeICO() external onlyOwner {
        require(!icoFinalized, "ReciclaICO: ICO already finalized");
        require(
            block.timestamp >= endTime || totalRaised >= hardCap,
            "ReciclaICO: ICO still active"
        );

        icoFinalized = true;

        emit ICOFinalized(totalRaised, totalTokensSold, softCapReached);
    }
    function claimRefund() external nonReentrant {
        require(icoFinalized, "ReciclaICO: ICO not finalized yet");
        require(
            !softCapReached,
            "ReciclaICO: Soft cap was reached, no refunds"
        );
        require(
            contributions[msg.sender] > 0,
            "ReciclaICO: No contribution to refund"
        );

        uint256 refundAmount = contributions[msg.sender];
        uint256 tokensToReturn = tokensPurchased[msg.sender];

        contributions[msg.sender] = 0;
        tokensPurchased[msg.sender] = 0;

        // Devolver tokens al contrato
        require(
            token.transferFrom(msg.sender, address(this), tokensToReturn),
            "ReciclaICO: Token return failed"
        );

        // Devolver MATIC al comprador
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "ReciclaICO: MATIC refund failed");

        emit RefundClaimed(msg.sender, refundAmount);
    }
    function withdrawFunds() external onlyOwner nonReentrant {
        require(icoFinalized, "ReciclaICO: ICO not finalized yet");
        require(softCapReached, "ReciclaICO: Soft cap not reached");
        require(address(this).balance > 0, "ReciclaICO: No funds to withdraw");

        uint256 amount = address(this).balance;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "ReciclaICO: Withdrawal failed");

        emit FundsWithdrawn(owner(), amount);
    }
    function withdrawUnsoldTokens() external onlyOwner {
        require(icoFinalized, "ReciclaICO: ICO not finalized yet");

        uint256 unsoldTokens = token.balanceOf(address(this));
        require(unsoldTokens > 0, "ReciclaICO: No unsold tokens");

        require(
            token.transfer(owner(), unsoldTokens),
            "ReciclaICO: Token transfer failed"
        );
    }

    // ADMIN FUNCTIONS
    function updateTokenPrice(uint256 newPrice) external onlyOwner {
        require(
            startTime == 0,
            "ReciclaICO: Cannot update price after ICO started"
        );
        require(newPrice > 0, "ReciclaICO: Price must be greater than zero");

        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;

        emit TokenPriceUpdated(oldPrice, newPrice);
    }
    function updateWeeklyDiscount(
        uint256 week,
        uint256 discount
    ) external onlyOwner {
        require(week > 0 && week <= 4, "ReciclaICO: Invalid week");
        require(discount <= 100, "ReciclaICO: Discount cannot exceed 100%");

        weeklyDiscounts[week] = discount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // VIEW FUNCTIONS
    function isICOActive() public view returns (bool) {
        return
            startTime > 0 &&
            block.timestamp >= startTime &&
            block.timestamp <= endTime &&
            !icoFinalized &&
            totalRaised < hardCap;
    }
    function getCurrentDiscount() public view returns (uint256) {
        if (startTime == 0) return 0;

        uint256 elapsed = block.timestamp - startTime;
        uint256 week = (elapsed / 1 weeks) + 1;

        if (week > 4) return 0;
        return weeklyDiscounts[week];
    }
    function calculateTokenAmount(
        uint256 maticAmount
    )
        external
        view
        returns (
            uint256 tokensWithoutDiscount,
            uint256 bonusTokens,
            uint256 totalTokens
        )
    {
        tokensWithoutDiscount = (maticAmount * 10 ** 18) / tokenPrice;
        uint256 discount = getCurrentDiscount();
        bonusTokens = (tokensWithoutDiscount * discount) / 100;
        totalTokens = tokensWithoutDiscount + bonusTokens;
    }
    function getICOProgress()
        external
        view
        returns (
            uint256 _totalRaised,
            uint256 _totalTokensSold,
            uint256 _softCapProgress,
            uint256 _hardCapProgress,
            uint256 _contributorsCount
        )
    {
        _totalRaised = totalRaised;
        _totalTokensSold = totalTokensSold;
        _softCapProgress = (totalRaised * 100) / softCap;
        _hardCapProgress = (totalRaised * 100) / hardCap;
        _contributorsCount = contributors.length;
    }
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= endTime || icoFinalized) return 0;
        return endTime - block.timestamp;
    }
    function getContributorInfo(
        address contributor
    )
        external
        view
        returns (
            uint256 maticContributed,
            uint256 tokensReceived,
            bool canClaimRefund
        )
    {
        maticContributed = contributions[contributor];
        tokensReceived = tokensPurchased[contributor];
        canClaimRefund =
            icoFinalized &&
            !softCapReached &&
            maticContributed > 0;
    }

    // RECEIVE FUNCTION

    receive() external payable {
        require(isICOActive(), "ReciclaICO: ICO is not active");
        require(msg.value > 0, "ReciclaICO: Must send MATIC");
        this.buyTokens{value: msg.value}();
    }
}
