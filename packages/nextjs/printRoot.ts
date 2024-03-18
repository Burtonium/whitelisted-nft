import whitelistAddresses from "./whitelistedAddresses.json";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

export const leaves = whitelistAddresses.map(x => keccak256(x));
const tree = new MerkleTree(leaves, keccak256, { sort: true });

const root = tree.getHexRoot();
console.log("root:", root);
