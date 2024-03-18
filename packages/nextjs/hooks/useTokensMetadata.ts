import { useEffect, useState } from "react";
import { useScaffoldContractRead } from "./scaffold-eth";
import { ipfsToHttps } from "~~/utils/ipfs";
import parseMetadata, { NFTMetadata } from "~~/utils/parseNFTMetadata";

const useTokensMetadata = (tokens?: number[]): NFTMetadata[] | undefined => {
  const [metadatas, setMetadatas] = useState<NFTMetadata[]>();

  const uriRead = useScaffoldContractRead({
    enabled: tokens !== undefined && tokens.length > 0,
    contractName: "TalismanNFT",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  useEffect(() => {
    if (uriRead.isSuccess && uriRead.data !== undefined && tokens !== undefined) {
      const url = uriRead.data as string;
      const urls = tokens.map(id => ipfsToHttps(url.replace("0", id.toString())));

      Promise.all(
        tokens.map(async (id, index) => {
          const json = await (await fetch(urls[index])).json();
          console.log("GOT JSON", json);
          return {
            id,
            ...json,
          };
        }),
      ).then(metas => {
        setMetadatas(metas.map(parseMetadata));
      });
    }
  }, [uriRead.data, uriRead.isSuccess, tokens]);

  return tokens && (tokens.length === 0 ? undefined : metadatas);
};

export default useTokensMetadata;
