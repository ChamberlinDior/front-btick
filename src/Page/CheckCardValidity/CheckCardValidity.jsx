import React, { useState } from 'react';
import { checkCardValidity } from '../../axiosConfig';
import './CheckCardValidity.css';

const CheckCardValidity = () => {
  const [cardNumber, setCardNumber] = useState('');

  const handleCheckValidity = async () => {
    try {
      await checkCardValidity(cardNumber);
      alert('Card validity checked successfully');
    } catch (error) {
      alert('Failed to check card validity');
    }
  };

  return (
    <div className="check-card-validity-container">
      <h1>Vérifier la validité de la carte</h1>
      <input
        type="text"
        placeholder="Numéro de carte"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button onClick={handleCheckValidity}>Vérifier</button>
    </div>
  );
};

export default CheckCardValidity;
