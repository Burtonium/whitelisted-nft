import whitelistAddresses from "./whitelistedAddresses.json";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "viem";

export const leaves = whitelistAddresses.map(x => keccak256(x as `0x${string}`));
const tree = new MerkleTree(leaves, keccak256, { sort: true });

const root = tree.getHexRoot();
console.log("root:", root);
