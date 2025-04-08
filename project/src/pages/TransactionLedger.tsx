import React, { useEffect, useState } from 'react';
import { Clock, User, MessageSquare } from 'lucide-react';
import { ethers } from 'ethers';
import contractABI from '../abi/ReputationSystem.json';
import contractAddress from '../contractAddress.json';

interface Rating {
  rater: string;
  score: number;
  comment: string;
  timestamp: number;
  to: string;
}

export default function TransactionLedger() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress.address, contractABI, provider);

        const users: string[] = await contract.getAllUsers();
        let allRatings: Rating[] = [];

        for (const user of users) {
          const userRatings = await contract.getAllRatings(user);
          const formattedRatings = userRatings.map((r: any) => ({
            rater: r.rater,
            score: Number(r.score),
            comment: r.comment,
            timestamp: Number(r.timestamp),
            to: user,
          }));
          allRatings.push(...formattedRatings);
        }

        // Sort by timestamp descending
        allRatings.sort((a, b) => b.timestamp - a.timestamp);
        setRatings(allRatings);
      } catch (err) {
        console.error('Error loading ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Transaction Ledger</h1>

      {loading ? (
        <p className="text-gray-500">Loading ratings from blockchain...</p>
      ) : ratings.length === 0 ? (
        <p className="text-gray-500">No ratings submitted yet.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {ratings.map((tx, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    Anonymous → {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Rating: {tx.score}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-5 w-5 text-gray-400 mr-1.5" />
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <User className="h-5 w-5 text-gray-400 mr-1.5" />
                    To: {tx.to}
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-1.5" />
                  {tx.comment}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
