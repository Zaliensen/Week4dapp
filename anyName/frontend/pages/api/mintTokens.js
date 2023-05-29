import { ethers } from 'ethers';
import MyERC20Votes from './assets/MyERC20Votes.json';
import { sepolia } from 'wagmi';

export const mintTokens = async () => {
  try {
    const network = process.env.NETWORK;
    const infuraApiKey = process.env.INFURA_API_KEY;
    const infuraApiSecret = process.env.INFURA_API_SECRET;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const provider = new ethers.providers.JsonRpcProvider(`https://${sepolia}.infura.io/v3/${infuraApiKey}:${infuraApiSecret}`);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, MyERC20Votes.abi, signer);
    const tx = await contract.mint();
    const result = await tx.wait();
    console.log('Minting result:', result);
  } catch (error) {
    console.error('Error minting tokens:', error);
  }
};

