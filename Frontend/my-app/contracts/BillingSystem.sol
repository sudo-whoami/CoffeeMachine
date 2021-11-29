// File: contracts/BillingSystem.sol

pragma solidity 0.8.7;

contract BillingSystem {
    mapping(address => Consumer) private consumers;
    address public owner;
    address[] public allConsumerAddress;

    struct Consumer {
        address consumerAccountAddress;
        string consumerFirstName;
        string consumerLastName;
        string email;
        bool isConsumerExists;
        uint256 coffeeQuantity;
        uint256 createTime;
        uint256 coffeeCoin;
        uint256[] coffeePurchaseDates;
    }

    constructor() {
        owner = msg.sender;
    }

    function register(string[] memory consumerInformation) public payable {
        string memory firstName = consumerInformation[0];
        string memory lastName = consumerInformation[1];
        string memory email = consumerInformation[2];
        Consumer memory consumer;
        consumer.consumerAccountAddress = msg.sender;
        consumer.consumerFirstName = firstName;
        consumer.consumerLastName = lastName;
        consumer.email = email;
        consumer.isConsumerExists = true;
        consumer.createTime = block.timestamp;
        consumer.coffeeQuantity = 0;
        consumers[msg.sender] = consumer;
        allConsumerAddress.push(consumer.consumerAccountAddress);
    }

    // @dev only call this function when the coffee machine is in working order.
    function purchaseCoffee() public payable {
        require(msg.value == 1 ether, 'Need to send 1 ETH');
        addPurchaseDate(msg.sender);
        addAmountOfPurchasedCoffees(msg.sender);
    }

    function addPurchaseDate(address consumerAddr) public {
        consumers[consumerAddr].coffeePurchaseDates.push(block.timestamp);
    }

    function addAmountOfPurchasedCoffees(address consumerAddr) public {
        consumers[consumerAddr].coffeeQuantity++;
    }

    function getAmountOfPurchasedCoffees() public view returns (uint256) {
        return consumers[msg.sender].coffeeQuantity;
    }

    function getConsumerName(address consumerAddr) public view returns (string memory, string memory) {
        return (
            consumers[consumerAddr].consumerFirstName,
            consumers[consumerAddr].consumerLastName
        );
    }

    function getConsumerExists(address consumerAddr) public view returns (bool) {
        return consumers[consumerAddr].isConsumerExists;
    }

    function punishment(address consumerAddr, uint256 a) public {
        if (a == 0) {
            consumers[consumerAddr].coffeeCoin -= 50;
        }
    }

    // this function hat not very much usefull for our project
    function getAccountCreateTime(address consumerAddr) public view returns (uint256) {
        return consumers[consumerAddr].createTime;
    }

    function getBalanceOf(address consumerAddr) public view returns (uint256) {
        return consumers[consumerAddr].coffeeCoin;
    }

    /// @dev call to deosit money. The user needs to deposit money before he can buy coffee
    function deposit() public payable {
        // Send Ether from msg.sender to owner
        require(msg.value == 1 ether, 'Need to send 1 ETH');
        // Convert amount of Ether to CoffeCoin and add the amount to consumer.coffeCoin
        // conversion-rate is 1 [Ether] : 1000 [CoffeCoins]

        consumers[msg.sender].coffeeCoin += 1000;
    }

    /// @notice returns true, if user has enough deposit to buy at least one coffeeCoin.
    /// @notice returns false, if user does not have enough deposit to buy a coffee.
    ///
    /// @dev this should be called everytime the user wants to buy a coffee. The user needs to have
    ///     at least 150 CoffeeCoins, 100 for the coffee itself, and 50 as safety deposit,
    ///     that would be charged additionally in case the user does not clean the coffee machine.

    function hasEnoughCoffeeCoins(address consumerAddr) public view returns (bool) {
        if (getConsumerExists(consumerAddr)) {
            return consumers[consumerAddr].coffeeCoin > 150;
        } else {
            return false;
        }
    }
}
