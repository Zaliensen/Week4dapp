// LogAddressesButton.js

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';

const LogAddressesButton = () => {
  const { data: signer } = useSigner();

  const handleLogAddresses = async () => {
    console.log('Environment variables:', process.env);
    console.log('ENV contract address:', process.env.CONTRACT_ADDRESS); // Log the contract address from .env file

    if (signer) {
      console.log('Signer address:', signer.address);
      
      const contractAddress = process.env.CONTRACT_ADDRESS;

      if (ethers.utils.isAddress(contractAddress)) { // Check if the contract address is valid
        const contract = new ethers.Contract(contractAddress, [], signer);
        console.log('Contract address:', contract.address);
      } else {
        console.log('Invalid contract address:', contractAddress);
      }
    } else {
      console.log('Signer not available.');
    }
  };

  return (
    <button onClick={handleLogAddresses}>
      Log Addresses
    </button>
  );
};

export default LogAddressesButton;
