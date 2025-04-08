// src/pages/RateColleagues.tsx
import React, { useState } from "react";
import { submitRating } from "../utils/contract";  // Ensure correct import

const RateColleagues = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [toAddress, setToAddress] = useState("");

  const handleRatingSubmit = async () => {
    try {
      const txHash = await submitRating(toAddress, rating, comment);
      console.log("Rating submitted successfully with tx hash:", txHash);
    } catch (error) {
      console.error("Error submitting rating:", error.message);
    }
  };

  return (
    <div>
      <h1>Rate Colleague</h1>
      <input
        type="text"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="Enter colleague's Ethereum address"
      />
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        placeholder="Enter rating (1-5)"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your comment"
      />
      <button onClick={handleRatingSubmit}>Submit Rating</button>
    </div>
  );
};

export default RateColleagues;
