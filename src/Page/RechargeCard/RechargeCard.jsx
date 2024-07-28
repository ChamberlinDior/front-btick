import React, { useState } from 'react';
import { rechargeClientByRfid } from '../../axiosConfig';
import './RechargeCard.css';

const RechargeCard = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [planType, setPlanType] = useState('');

  const handleRecharge = async () => {
    try {
      const data = await rechargeClientByRfid(cardNumber, planType);
      alert(`Card recharged: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error("Error response:", error.response);
      alert(`Failed to recharge card: ${error.response?.data || error.message}`);
    }
  };

  return (
    <div className="recharge-card-container">
      <h1>Recharge Card</h1>
      <input
        type="text"
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Plan Type (daily, weekly, monthly)"
        value={planType}
        onChange={(e) => setPlanType(e.target.value)}
      />
      <button onClick={handleRecharge}>Recharge Card</button>
    </div>
  );
};

export default RechargeCard;
