import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ethers } from "ethers";
import contractABI from "../abi/ReputationSystem.json";
import contractAddress from "../contractAddress.json";

export default function RateColleagues() {
  const [contract, setContract] = useState<any>(null);
  const [colleagues, setColleagues] = useState<{ address: string; name: string }[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [newColleagueAddress, setNewColleagueAddress] = useState("");
  const [newColleagueName, setNewColleagueName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          alert("MetaMask not detected");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const instance = new ethers.Contract(
          contractAddress.address,
          contractABI.abi,
          signer
        );

        setContract(instance);
        await fetchColleagues(instance);
        setLoading(false);
      } catch (err) {
        console.error("Contract init failed:", err);
        alert("Error initializing contract. Check console for details.");
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchColleagues = async (instance: any) => {
    try {
      const list = await instance.getAllColleagues();
      const formatted = list.map((col: any) => ({
        address: col.wallet,
        name: col.name,
      }));
      setColleagues(formatted);
    } catch (err) {
      console.error("Error fetching colleagues:", err);
    }
  };

  const handleAddColleague = async () => {
    if (!newColleagueAddress || !newColleagueName) {
      alert("Enter both name and wallet address");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const tx = await contract.addColleague(newColleagueAddress, newColleagueName);
      await tx.wait();
      setNewColleagueAddress("");
      setNewColleagueName("");
      fetchColleagues(contract);
    } catch (err) {
      console.error("Error adding colleague:", err);
      alert("Failed to add colleague. Check console for details.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress || rating === 0 || !comment) {
      alert("Please fill all fields before submitting");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const tx = await contract.rateUser(selectedAddress, rating, comment);
      await tx.wait();
      alert("Rating submitted successfully!");
      setSelectedAddress("");
      setRating(0);
      setComment("");
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      alert(err?.reason || "Rating failed");
    }
  };

  if (loading) {
    return <p className="text-center">Loading smart contract...</p>;
  }

  if (!contract) {
    return <p className="text-center text-red-500">Contract not loaded. Please refresh the page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rate Colleagues</h1>

      {/* Add Colleague */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Add Colleague</h2>
        <input
          type="text"
          placeholder="Colleague Wallet Address"
          value={newColleagueAddress}
          onChange={(e) => setNewColleagueAddress(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          type="text"
          placeholder="Colleague Name"
          value={newColleagueName}
          onChange={(e) => setNewColleagueName(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <button
          onClick={handleAddColleague}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          Add Colleague
        </button>
      </div>

      {/* Rate Colleague */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label>Select Colleague:</label>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Choose...</option>
            {colleagues.map((col) => (
              <option key={col.address} value={col.address}>
                {col.name} ({col.address.slice(0, 6)}...)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Rating:</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer ${
                  rating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div>
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          Submit Rating
        </button>
      </form>
    </div>
  );
}
