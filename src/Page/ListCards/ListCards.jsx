import React, { useEffect, useState } from 'react';
import { getAllClients } from '../../axiosConfig';
import './ListCards.css';

const ListCards = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getAllClients();
        setClients(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des clients :", error);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="list-clients-container">
      <h2>Liste des Clients</h2>
      <table className="clients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.firstName}</td>
              <td>{client.lastName}</td>
              <td>{client.email}</td>
              <td>{client.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListCards;
