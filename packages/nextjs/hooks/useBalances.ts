import { useMemo } from "react";
import { useScaffoldContractRead } from "./scaffold-eth";
import useTokensMetadata from "./useTokensMetadata";
import { useAccount } from "wagmi";
import { NFTMetadata } from "~~/utils/parseNFTMetadata";

type NFTMetadataWithId = NFTMetadata & { id: number };

const useBalances = () => {
  const account = useAccount();
  const balances = useScaffoldContractRead({
    contractName: "TalismanNFT",
    functionName: "balances",
    args: [account.address],
  });

  console.log(balances.data);

  const ownedTokens = useMemo(
    () => balances.data && balances.data.map(n => parseInt(n.toString(), 10)),
    [balances.data],
  );

  const metadatas = useTokensMetadata(ownedTokens);

  const tokens = useMemo<undefined | NFTMetadataWithId[]>(
    () =>
      metadatas &&
      balances.data &&
      balances.data.map((tokenId: bigint) => ({
        ...metadatas[parseInt(tokenId.toString())],
        id: parseInt(tokenId.toString()),
      })),
    [balances.data, metadatas],
  );

  return {
    ...balances,
    data: tokens,
  };
};

export default useBalances;
