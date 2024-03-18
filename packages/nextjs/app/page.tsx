/* eslint-disable prettier/prettier */
'use client';

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import TalismanNFT from "~~/components/WhitelistedNFT";

const Home: NextPage = () => {
  const { address } = useAccount();

  return (
    <>
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
