import React, { useEffect, useState } from "react";
import Web3 from "web3";
import TokenAirdrop from "./contracts/TokenAirdrop.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [airdropAmount, setAirdropAmount] = useState("");
  const [recipients, setRecipients] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeWeb3();
    initializeContract();
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Error initializing web3", error);
      }
    } else if (window.web3) {
      const web3Instance = new Web3(window.web3.currentProvider);
      setWeb3(web3Instance);
    } else {
      console.error("No web3 provider detected");
    }
  };

  const initializeContract = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TokenAirdrop.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        TokenAirdrop.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error initializing contract", error);
    }
  };

  const handleTokenAddressChange = (event) => {
    setTokenAddress(event.target.value);
  };

  const handleAirdropAmountChange = (event) => {
    setAirdropAmount(event.target.value);
  };

  const handleRecipientsChange = (event) => {
    setRecipients(event.target.value);
  };

  const handleAirdrop = async () => {
    try {
      setError(null);
      const recipientAddresses = recipients.split(",");
      await contract.methods
        .airdrop(recipientAddresses, airdropAmount)
        .send({ from: accounts[0] });
      alert("Airdrop successful!");
    } catch (error) {
      setError(error.message);
      console.error("Error performing airdrop", error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    } catch (error) {
      console.error("Error connecting wallet", error);
    }
  };

  return (
    <div>
      <h1>Token Airdrop</h1>
      {web3 && (
        <div>
          <button onClick={connectWallet}>Connect Wallet</button>
          {accounts.length > 0 && (
            <p>Connected Account: {accounts[0]}</p>
          )}
          <div>
            <label>Token Address:</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={handleTokenAddressChange}
            />
          </div>
          <div>
            <label>Airdrop Amount:</label>
            <input
              type="number"
              value={airdropAmount}
              onChange={handleAirdropAmountChange}
            />
          </div>
          <div>
            <label>Recipients (comma-separated addresses):</label>
            <input
              type="text"
              value={recipients}
              onChange={handleRecipientsChange}
            />
          </div>
          <button onClick={handleAirdrop}>Perform Airdrop</button>
          {error && (
            <p style={{ color: "red" }}>Error: {error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
