import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { parseEther } from "ethers";

// proof for 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
const proof = [
  "0xf6d82c545c22b72034803633d3dda2b28e89fb704f3c111355ac43e10612aedc",
  "0x198bf4b157028bd818b30ce2f1b1a63feceee122e59515edfa7dd53906d1f5ad",
  "0x9a1f526d725e5e1dda21ae0f2539a3fe6b35b83613587f79cca45bd0a2b9ac07",
];

const deploy = async () => {
  const talismanNFTFactory = await ethers.getContractFactory("TalismanNFT");
  const signers = (await ethers.getSigners()).slice(0, 5);
  const talismanNFT = await talismanNFTFactory.deploy();

  await talismanNFT.waitForDeployment();

  return {
    talismanNFT,
    signers,
  };
};

describe("TalismanNFT", () => {
  it("Claim should fail lower than 1 ETH", async () => {
    const { talismanNFT } = await loadFixture(deploy);
    await expect(talismanNFT.claim(proof, { value: parseEther("0.99") })).to.be.revertedWith("Insufficient funds");
  });

  it("Claim should fail with wrong proof", async () => {
    const { talismanNFT } = await loadFixture(deploy);
    await expect(talismanNFT.claim(proof.slice().reverse(), { value: parseEther("1") })).to.be.revertedWith(
      "Invalid proof",
    );
  });

  it("Claim should work from owner", async () => {
    const { talismanNFT } = await loadFixture(deploy);
    await expect(await talismanNFT.claim(proof, { value: parseEther("1") })).to.emit(talismanNFT, "NFTClaimed");
  });
});
