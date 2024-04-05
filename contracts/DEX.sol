pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    IERC20 public associatedToken;
    uint price;
    address owner;

    constructor(IERC20 _token, uint _price) {
        associatedToken = _token;
        price = _price;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not the owner");
        _;
    }

    function sell() external onlyOwner {
        // sells or transfer token mints from the original owner to this smart contract
        uint allowance = associatedToken.allowance(msg.sender, address(this));
        require(
            allowance > 0,
            "you must allow this contract access to at least one token"
        );
        bool sent = associatedToken.transferFrom(
            msg.sender,
            address(this),
            allowance
        );
        require(sent, "failed to send");
    }

    function withdrawTokens() external onlyOwner {
        uint balance = associatedToken.balanceOf(address(this));
        associatedToken.transfer(msg.sender, balance);
    }

    function withdrawFunds() external onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "failed to send");
    }

    function getPrice(uint numberOfTokens) public view returns (uint) {
        return numberOfTokens * price;
    }

    function buy(uint numberOfTokens) external payable {
        require(numberOfTokens <= getTokenBalance(), "not enough tokens");
        uint priceForTokens = getPrice(numberOfTokens);
        require(msg.value == priceForTokens, "insufficient funds");
        associatedToken.transfer(msg.sender, numberOfTokens);
    }

    function getTokenBalance() public view returns (uint) {
        return associatedToken.balanceOf(address(this));
    }
}
