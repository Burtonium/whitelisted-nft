import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const OwnerPanel = () => {
  const { address } = useAccount();

  const { data: ownerAddress, refetch } = useScaffoldContractRead({
    contractName: "TalismanNFT",
    functionName: "owner",
  });

  const updateMerkleRoot = useScaffoldContractWrite({
    contractName: "TalismanNFT",
    functionName: "updateMerkleRoot",
    onSettled: () => {
      refetch();
    },
    args: ["0x"],
  });

  const withdrawFunds = useScaffoldContractWrite({
    contractName: "TalismanNFT",
    functionName: "withdraw",
  });

  const form = useForm<{ merkleRoot: string }>();

  useScaffoldContractRead({
    contractName: "TalismanNFT",
    functionName: "whitelistMerkleRoot",
    onSuccess: root => {
      form.setValue("merkleRoot", root as string);
    },
  });

  const onSubmit: SubmitHandler<{ merkleRoot: string }> = useCallback(
    async values => {
      updateMerkleRoot.write({ args: [values.merkleRoot] });
    },
    [updateMerkleRoot],
  );

  return (
    <>
      {!!address && ownerAddress === address ? (
        <div className="card rounded-xl m-5">
          <div className="p-10 card-body flex flex-col gap-5">
            <h2 className="text-2xl font-bold">Owner Panel</h2>
            <div className="text-center">
              <button className="btn btn-primary" onClick={() => withdrawFunds.write()}>
                Withdraw Funds
              </button>
            </div>
            <form className="flex justify-center items-center  gap-2" onSubmit={form.handleSubmit(onSubmit)}>
              <input {...form.register("merkleRoot")} className="input w-100" type="text" placeholder="Merkle Root" />
              <button type="submit" className="btn btn-primary">
                Update Merkle Root
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default OwnerPanel;
