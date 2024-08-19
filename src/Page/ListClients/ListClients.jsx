import React, { useEffect, useState } from 'react';
import { getAllClients } from '../../axiosConfig';
import './ListClients.css';

const ListClients = () => {
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
            <th>Numéro Client</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Quartier</th>
            <th>Ville</th>
            <th>Date de Création</th>
            <th>Agent de Création</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.numClient}</td>
              <td>{client.nom}</td>
              <td>{client.prenom}</td>
              <td>{client.quartier}</td>
              <td>{client.ville}</td>
              <td>{new Date(client.dateCreation).toLocaleString()}</td>
              <td>{client.agentCreation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListClients;
