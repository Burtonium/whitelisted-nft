/* eslint-disable prettier/prettier */
'use client';

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import OwnerPanel from "~~/components/OwnerPanel";
import TalismanNFT from "~~/components/TalismanNFT";

const Home: NextPage = () => {
  const { address } = useAccount();

  return (
    <>
      <OwnerPanel />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          {address
            ? <TalismanNFT />
            : <p>Please connect your wallet to play the game.</p>}
        </div>
      </div>
    </>
  );
};

export default Home;
