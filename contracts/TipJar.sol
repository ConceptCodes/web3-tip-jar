// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/// @title TipJar
/// @author conceptcodes.eth
/// @notice This contract allows users to send tips to the the owner
/// @dev This contract is used to send tips
/// @dev This contract allows the owner to withdraw the tips
contract TipJar is Ownable {
  // state variable to hold the total tips collected
  uint256 public totalTips;

  // mapping to store tips and tipper
  mapping(address => uint256) public tips;

  // event to log tips collected
  event TipReceived(address indexed from, uint256 amount);

  // event to log tips withdrawn
  event TipsWithdrawn(address indexed to, uint256 amount);

  /// @notice constructor to initialize the total tips collected to 0
  constructor() {
    totalTips = 0;
  }

  /// @notice fallback payable function to receive tips
  /// @dev this function is called when a sends ether to this contract
  receive() external payable {
    require(msg.value > 0, 'You must send some Ether');

    // update total tips collected
    totalTips += msg.value;

    // update mapping of tips
    tips[msg.sender] += msg.value;

    // emit event to log tips collected
    emit TipReceived(msg.sender, msg.value);
  }

  /// @notice function to withdraw tips collected
  /// @dev uses the onlyOwner modifier from the Ownable contract
  function withdrawTips() public onlyOwner {
    require(address(this).balance > 0, 'Insufficient balance');

    // calculate the amount to withdraw
    uint256 amount = address(this).balance;

    // update total tips collected
    totalTips -= amount;

    // transfer the amount to the owner
    payable(owner()).transfer(amount);

    // emit event to log tips withdrawn
    emit TipsWithdrawn(owner(), amount);
  }
}
