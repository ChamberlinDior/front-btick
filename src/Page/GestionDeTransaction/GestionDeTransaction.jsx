// src/Page/GestionDeTransaction/GestionDeTransaction.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GestionDeTransaction.css'; // Importation du fichier CSS

const GestionDeTransaction = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Récupérer toutes les transactions depuis le backend
    axios.get('/api/transactions')
      .then(response => {
        setTransactions(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des transactions:", error);
      });
  }, []);

  return (
    <div className="gestion-transaction-page">
      <h2 className="page-title">Gestion des Transactions</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Terminal ID</th>
            <th>Type de Forfait</th>
            <th>RFID Client</th>
            <th>ID Utilisateur</th>
            <th>Date de Transaction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.terminalId}</td>
                <td>{transaction.forfaitType}</td>
                <td>{transaction.clientRfid}</td>
                <td>{transaction.utilisateurId}</td>
                <td>{new Date(transaction.dateTransaction).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">Aucune transaction disponible</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GestionDeTransaction;
