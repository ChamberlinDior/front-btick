import React, { useState } from 'react';
import { createClient } from '../../axiosConfig';
import './CreateClient.css';

function CreateClient() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    quartier: '',
    ville: '',
    agentCreation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createClient(formData);
      console.log("Client créé avec succès:", response);
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
    }
  };

  return (
    <div className="create-client-container">
      <h1>Créer un nouveau client</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
        />
        <input
          type="text"
          name="quartier"
          placeholder="Quartier"
          value={formData.quartier}
          onChange={handleChange}
        />
        <input
          type="text"
          name="ville"
          placeholder="Ville"
          value={formData.ville}
          onChange={handleChange}
        />
        <input
          type="text"
          name="agentCreation"
          placeholder="Nom de l'Agent"
          value={formData.agentCreation}
          onChange={handleChange}
        />
        <button type="submit">Créer le client</button>
      </form>
    </div>
  );
}

export default CreateClient;
