import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [data, setData] = useState({
    userAddress: null,
    blockNumber: null,
    balance: null,
    formatedBalance: null,
  });

  /**
   * Expand:
   * 1. Detect the Ethereum provider (window.ethereum)
   * 2. Detect which Ethereum network the user is connected to
   * 3. Get the user's Ethereum account(s)
   *
   * Add deeplink for mobile support (because no extensions)
   */
  async function connect() {
    if (!window.ethereum) {
      alert("Get MetaMask!");
      return;
    }

    const userAddress = (await provider!.send("eth_requestAccounts", []))[0];

    const [balance, formatedBalance] = await Promise.all([
      provider!.getBalance(userAddress),
      ethers.utils.formatEther(await provider!.getBalance(userAddress)),
    ]);

    // @ts-ignore
    setData((d) => ({
      ...d,
      userAddress,
      balance,
      formatedBalance,
    }));
  }

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    // Check if wallet is connected
    if (!window.ethereum) {
      return;
    }

    provider!.send("eth_accounts", []).then(async (accounts) => {
      if (accounts.length > 0) {
        const [balance, formatedBalance] = await Promise.all([
          provider!.getBalance(accounts[0]),
          ethers.utils.formatEther(await provider!.getBalance(accounts[0])),
        ]);

        // @ts-ignore
        setData((d) => ({
          ...d,
          userAddress: accounts[0],
          balance,
          formatedBalance,
        }));
      }
    });

    // TODO: does not work
    // provider.on("accountsChanged", (_) => {
    //   console.log("accountsChanged");
    //   window.location.reload();
    // });
    // provider.on("chainChanged", (_) => {
    //   console.log("chainChanged");
    //   window.location.reload();
    // });
  }, []);

  return data.userAddress ? (
    <pre>{JSON.stringify(data, null, 4)}</pre>
  ) : (
    <button onClick={() => connect()}>Connect to MetaMask</button>
  );
}
