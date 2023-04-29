import Unidata from "unidata.js";

import { IPFS_GATEWAY } from "@/constants/env";
import { useWeb3 } from "@/hooks/use-web3";

let unidata: Unidata;

export const useUnidata = () => {
  const { web3 } = useWeb3();

  if (web3) {
    unidata = new Unidata({
      ethereumProvider: web3.provider,
      ipfsGateway: IPFS_GATEWAY,
      ipfsRelay: "https://ipfs-relay.crossbell.io/json?gnfd=t",
    });
  }
  else {
    unidata = new Unidata({
      ipfsGateway: IPFS_GATEWAY,
    });
  }

  return unidata;
};
