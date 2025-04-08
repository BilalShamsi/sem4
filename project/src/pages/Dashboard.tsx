import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getUserRatings } from '../utils/contract';

export default function Dashboard() {
  const { account } = useWallet();
  const [ratings, setRatings] = useState<number[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRatings = async () => {
      if (!account) return;
      try {
        const { ratings, comments } = await getUserRatings(account);
        setRatings(ratings);
        setComments(comments);
      } catch (err: any) {
        console.error(err);
        alert(`❌ Failed to load ratings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, [account]);

  const averageRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
    : 'N/A';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your Dashboard</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            <p>
              <strong>Address:</strong> <span className="font-mono">{account}</span>
            </p>
            <p>
              <strong>Average Rating:</strong> {averageRating}
            </p>
            <p>
              <strong>Total Ratings Received:</strong> {ratings.length}
            </p>
            <div>
              <h2 className="text-lg font-semibold mt-4 mb-2">Recent Comments:</h2>
              {comments.length === 0 ? (
                <p className="text-gray-500">No feedback yet.</p>
              ) : (
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  {comments.slice(-5).reverse().map((comment, idx) => (
                    <li key={idx}>{comment}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
