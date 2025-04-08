import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { ethers } from 'ethers';
import contractABI from '../abi/ReputationSystem.json';
import contractAddress from '../contractAddress.json';

interface LeaderboardEntry {
  address: string;
  averageScore: number;
  totalRatings: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress.address, contractABI, provider);
        const users: string[] = await contract.getAllUsers();

        const scores: LeaderboardEntry[] = await Promise.all(
          users.map(async (user) => {
            const [avg, total] = await contract.getAverageScore(user);
            return {
              address: user,
              averageScore: Number(avg),
              totalRatings: Number(total),
            };
          })
        );

        const sorted = scores
          .filter((u) => u.totalRatings > 0)
          .sort((a, b) => b.averageScore - a.averageScore);

        setLeaderboard(sorted);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        <Trophy className="text-yellow-500" /> Leaderboard
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-gray-500">No ratings available yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <li key={entry.address} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-indigo-600">
                    #{index + 1} - {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg Score: {entry.averageScore} ({entry.totalRatings} ratings)
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
