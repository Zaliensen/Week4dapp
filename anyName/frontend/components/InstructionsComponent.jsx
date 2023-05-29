import { useNetwork, useSigner, useBalance,erc20ABI, useContract } from "wagmi";
import styles from "../styles/InstructionsComponent.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import * as React from 'react';
import * as BallotJson from '../assets/Ballot.json';
import {ethers, Contract} from 'ethers';




export default function InstructionsComponent() {
    const router = useRouter();
    return (
        <div className={styles.container}>
            <header className={styles.header_container}>
                <h1>Welcome to the Dapp</h1>
                <p>Group 9</p>
            </header>
            <div className={styles.buttons_container}>
                <PageBody />
            </div>
            <div className={styles.footer}></div>
        </div>
    );
}

function PageBody() {
    return (
        <>
            <WalletInfo />
            <RequestTokens />
            <ViewProposals />
            <ViewVotes />
            <Vote />
        </>
    );
}






function WalletInfo() {
  const { data: signer } = useSigner();
  const [balanceData, setBalanceData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(signer); // Check if signer is defined
    if (signer) {
        console.log(signer._address); // Check if signer._address is defined
    }
  }, [signer]);

  const requestWalletBalance = async () => {
      setLoading(true);
      try {
          const walletBalance = await WalletBalance(signer._address);
          setBalanceData(walletBalance);
      } catch (error) {
          setError(error.message);
      }
      setLoading(false);
  };

  if (isLoading) return <p>Requesting balance...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
      <div>
          <h1>Request Wallet's balance</h1>
          {balanceData && 
              <p>Balance of the wallet: {balanceData} </p>
          }
          <button onClick={requestWalletBalance}>Request balance</button>
      </div>
  );
}

async function WalletBalance(address) {
  const requestOptions = {
      method: 'GET',
      headers: {'Content-Type':'application/json'}
  };

  const response = await fetch(`http://localhost:3001/balance?address=${address}`, requestOptions);
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  } else {
      const data = await response.json();
      return data;
  }
}

function RequestTokens() {
    const { data: signer } = useSigner();
    const [txData, setTxData] = useState(null);
    const [isLoading, setLoading] = useState(false);

    const handleButtonClick = () => {
      requestTokens(signer, setLoading, setTxData);
    }

    if (txData) return (
        <div>
            <p>Transaction completed!</p>
            <a href={"https://sepolia.etherscan.io/tx/" + txData.hash} target="_blank">{txData.hash}</a>
        </div>
    )
    if (isLoading) return <p>Requesting tokens to be minted...</p>;
    return (
        <div>
          <h1>Request tokens to be minted</h1>
          <button style={{outlineColor: 'primary'}} onClick={handleButtonClick}
          >Request tokens</button>
        </div>
    );
}

async function requestTokens(signer, setLoading, setTxData) {
  setLoading(true);

  const message = "Some message";
  const signature = await signer.signMessage(message);

  const requestOptions = {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({address: signer._address, signature: signature})
  };

  fetch('http://localhost:3001/request-tokens', requestOptions)
  .then(response => response.json())
  .then((data) => {
      setTxData(data);
      setLoading(false);
  });
}


function ViewVotes() {
    const { data: signer } = useSigner();
    const [votesData, setVotesData] = useState(null);
    const [isLoading, setLoading] = useState(false);

    const handleButtonClick = () => {
      fetchVotes(signer._address, setLoading, setVotesData);
    }

    if (votesData) return (
        <div>
            <p>Votes balance of the account: {votesData} </p>
        </div>
    )
    if (isLoading) return <p>Requesting votes...</p>;
    return (
        <div>
          <h1>Request account's votes</h1>
          <button onClick={handleButtonClick}>Request account's votes</button>
        </div>
    );
}

function fetchVotes(address, setLoading, setVotesData) {
    setLoading(true);
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type':'application/json'}
    };

    fetch('http://localhost:3001/api/vote', requestOptions)
    .then(response => response.text())  // Change this line
    .then(text => {
        console.log('Response:', text);
        return JSON.parse(text);
    })
    .then((data) => {
      setTxData(data);
      setLoading(false);
    })
    .catch(error => console.error('Error:', error));

}
function Vote(proposalId, proposalName) {
  const { data: signer } = useSigner();
  const [proposal, setProposal] = useState("");
  const [amount, setAmount] = useState("");
  const [txData, setTxData] = useState(null);
  const [isLoading, setLoading] = useState(false);
 
  if(signer){
    const provider = new ethers.providers.InfuraProvider("sepolia", process.env.NEXT_PUBLIC_INFURA_API_KEY);
    const ballotContract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, BallotJson.abi, provider);

  if (txData) {
    return (
      <div>
        <p>Transaction completed!</p>
        <a href={"https://sepolia.etherscan.io/tx/" + txData} target="_blank">
          {txData}
        </a>
      </div>
    );
  }

  if (isLoading) return <p>Wait...</p>;

  return (
    <div>
      <h1>Cast vote</h1>
      <input
        type="number"
        placeholder="Proposal ID"
        value={proposal}
        onChange={(e) => setProposal(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Votes"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={async () => await vote(ballotContract, signer, proposal, amount, setLoading, setTxData)}>Cast vote</button>


    </div>
  );
}
return <p> Please connect your wallet </p>


async function vote(ballotContract, signer, proposal, amount, setLoading, setTxData) {
  setLoading(true);

  const transactionResponse = await ballotContract.connect(signer).vote(proposal, ethers.utils.parseUnits(amount));

  // Wait for the transaction to be mined and get the transaction receipt
  const receipt = await transactionResponse.wait();

  // Now, receipt.transactionHash should have the transaction hash which you can send to the backend.
  const txHash = receipt.transactionHash;

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposal: parseInt(proposal), amount: parseInt(amount), signature: txHash })
  };

  fetch('http://localhost:3001/vote', requestOptions)
    .then(response => response.json())
    .then((data) => {
      setTxData(JSON.stringify(data));
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error:', error);
      setLoading(false);
    });
}
}





function ViewProposals() {
  const [proposals, setProposals] = useState(null);

  useEffect(() => {
      fetchProposals(setProposals);
  }, []);

  if (!proposals) return <p>Loading proposals...</p>;
  
  return (
    <div>
      <h2>Current Proposals:</h2>
      {proposals.map((proposal, index) => 
        <p key={index}>Proposal {index + 1}: {proposal.name} (Votes: {proposal.voteCount})</p>
      )}
    </div>
  );
}

function fetchProposals(setProposals) {
  fetch('http://localhost:3001/proposals')
    .then(response => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setProposals(data);
      } else {
        console.log("No proposals in response data");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}





