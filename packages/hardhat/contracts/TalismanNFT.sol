// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { BitMaps } from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TalismanNFT
 * @dev This contract represents a non-fungible token (NFT) contract that allows users to claim NFTs by providing a valid merkle proof.
 * The contract inherits from ERC721, Ownable2Step contracts.
 * @author Matt Burton
 * It implements functionality for claiming NFTs, updating the whitelist merkle root, and withdrawing the contract's balance.
 */
contract TalismanNFT is ERC721, Ownable2Step {
	using BitMaps for BitMaps.BitMap;

	uint256 public constant NFT_PRICE = 1 ether;
	uint32 public constant MAX_SUPPLY = 10;

	event NFTClaimed(address indexed account, uint256 tokenId);

	bytes32 public whitelistMerkleRoot =
		0xd178f13658b238eabe23e5aa929690bbd7db7141ecbc36ad190d95d98709aa2b;

	BitMaps.BitMap private _claimed;
	uint32 public currentNFTId;

	error NFTLimitReached();

	/**
	 * @dev Constructor function.
	 * Sets the name and symbol of the NFT contract and sets the contract owner.
	 */
	constructor() ERC721("TalismanNFT", "TALI") Ownable(msg.sender) {}

	/**
	 * @dev Internal function to return the base URI for the NFTs.
	 * @return The base URI for the NFTs.
	 */
	function _baseURI() internal pure override returns (string memory) {
		return "ipfs://QmSXSqTNGkE5FWATUD9nb8DJHrT2UctPvRtCddmvDNLv1w/";
	}

	/**
	 * @dev Updates the whitelist merkle root.
	 * @param _whitelistMerkleRoot The new whitelist merkle root.
	 * Only the contract owner can call this function.
	 */
	function updateMerkleRoot(bytes32 _whitelistMerkleRoot) public onlyOwner {
		whitelistMerkleRoot = _whitelistMerkleRoot;
	}

	/**
	 * @dev Modifier that checks if the sender has not claimed before.
	 * Reverts with an "Already Claimed" error if the sender has already claimed.
	 */
	modifier hasntClaimedBefore() {
		require(!_claimed.get(uint160(msg.sender)), "Already Claimed");
		_;
	}

	/**
	 * @dev Modifier that checks if the sender is whitelisted.
	 * It verifies the merkle proof against the whitelist merkle root and the hashed sender address.
	 * Reverts with an "Invalid proof" error if the merkle proof is invalid.
	 * @param merkleProof The merkle proof to be verified.
	 */
	modifier isWhitelisted(bytes32[] calldata merkleProof) {
		bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
		require(
			MerkleProof.verify(merkleProof, whitelistMerkleRoot, leaf),
			"Invalid proof"
		);
		_;
	}

	/**
	 * @dev Allows a user to claim an NFT by providing a valid merkle proof.
	 * @param merkleProof The merkle proof for verifying the user's eligibility to claim the NFT.
	 */
	function claim(
		bytes32[] calldata merkleProof
	) external payable hasntClaimedBefore isWhitelisted(merkleProof) {
		require(msg.value >= NFT_PRICE, "Insufficient funds");
		if (currentNFTId >= MAX_SUPPLY) {
			revert NFTLimitReached();
		}

		_claimed.set(uint160(msg.sender));

		uint32 tokenId = currentNFTId++;
		emit NFTClaimed(msg.sender, tokenId);
		_mint(msg.sender, tokenId);
	}

	/**
	 * @dev Allows the owner of the contract to withdraw the contract's balance.
	 * Emits a `Transfer` event upon successful withdrawal.
	 *
	 * Requirements:
	 * - The caller must be the owner of the contract.
	 * - The withdrawal must be successful.
	 */
	function withdraw() external onlyOwner {
		(bool ok, ) = payable(owner()).call{ value: address(this).balance }("");
		require(ok, "Transfer failed");
	}
}
