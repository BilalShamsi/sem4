// src/utils/contract.ts
import { ethers } from "ethers";
import contractAbi from "../abi/ReputationSystem.json";
import contractAddress from "../contractAddress.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(contractAddress.address, contractAbi.abi, signer);  // Ensure contract ABI is correct
  return { provider, signer, contract };
};

// Submit a rating to the contract
export const submitRating = async (toAddress: string, rating: number, comment: string) => {
  const { contract, signer } = await getContract();
  const sender = await signer.getAddress();

  // Log the toAddress to ensure it's correctly passed
  console.log("toAddress passed to submitRating: ", toAddress);

  // Ensure the address is not empty or null
  if (!toAddress || toAddress.trim() === "") {
    throw new Error("Please select a colleague to rate.");
  }

  // Log the original and checksummed address
  console.log("Attempting to checksum the address: ", toAddress);

  let checksummedAddress: string;
  try {
    // Validate and checksum the address
    checksummedAddress = ethers.utils.getAddress(toAddress);
    console.log("Checksum Address: ", checksummedAddress); // Log checksummed address
  } catch (err) {
    console.error("Error while formatting address:", err);
    throw new Error("Invalid Ethereum address format.");
  }

  // Ensure user cannot rate themselves
  if (checksummedAddress.toLowerCase() === sender.toLowerCase()) {
    throw new Error("You cannot rate yourself.");
  }

  // Submit the rating to the contract
  const tx = await contract.rateUser(checksummedAddress, rating, comment);
  await tx.wait();
  return tx.hash;
};

// Fetch all transactions from the contract
export const fetchAllTransactions = async () => {
  const { contract } = await getContract();
  const logs = await contract.queryFilter(contract.filters.UserRated());

  const parsed = await Promise.all(
    logs.map(async (log: any) => {
      const { rater, ratee, score, comment, timestamp } = log.args;
      const block = await log.getBlock();
      const readableTimestamp = new Date(block.timestamp * 1000).toLocaleString();

      return {
        id: log.transactionHash,
        timestamp: readableTimestamp,
        from: "Anonymous",
        to: ratee,
        rating: parseFloat(score.toString()),
        comment,
      };
    })
  );

  return parsed;
};

// Get all ratings for a specific user
export const getUserRatings = async (userAddress: string) => {
  const { contract } = await getContract();

  // Validate and checksum the address
  let checksummedAddress: string;
  try {
    checksummedAddress = ethers.utils.getAddress(userAddress);
  } catch (err) {
    throw new Error("Invalid Ethereum address format.");
  }

  const result = await contract.getAllRatings(checksummedAddress);
  const ratings = result.map((r: any) => parseFloat(r.score.toString()));
  const comments = result.map((r: any) => r.comment);
  return { ratings, comments };
};

// Get all users from the contract
export const getAllUsers = async () => {
  const { contract } = await getContract();
  return await contract.getAllUsers();
};
