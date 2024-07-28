import React, { useState } from 'react';
import { createClient } from '../../axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Select, MenuItem, InputLabel, Button } from '@mui/material';
import './CreateClient.css';

const CreateClient = () => {
  const [clientData, setClientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    districtCity: '',
    address: '',
    phoneNumber: '',
    email: '',
    agent: '',
    submissionDate: '',
    rfid: '',
    planType: '' // Ajout du planType
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleCreateClient = async () => {
    try {
      await createClient(clientData);
      alert('Client créé avec succès');
      navigate('/list-clients');
    } catch (error) {
      alert('Échec de la création du client');
    }
  };

  return (
    <div className="create-client-page">
      <nav className="vertical-menu">
        <div className="logo-container">
          <img src="https://st.depositphotos.com/1018326/1272/i/450/depositphotos_12720218-stock-illustration-bus-transport.jpg" alt="Bus Logo" className="logo" />
        </div>
        <ul>
          <li className="menu-section">
            <button className="menu-button">Client</button>
            <div className="sub-menu">
              <Link to="/create-client" className="sub-menu-button">Création d'un client</Link>
              <Link to="/list-clients" className="sub-menu-button">Gestions des clients existants</Link>
            </div>
          </li>
          <li className="menu-section">
            <button className="menu-button">Carte</button>
            <div className="sub-menu">
              <Link to="/create-card" className="sub-menu-button">Créer une carte</Link>
              <Link to="/list-cards" className="sub-menu-button">Gestion des cartes existantes</Link>
            </div>
          </li>
          <li className="menu-section">
            <button className="menu-button">Transaction</button>
            <div className="sub-menu">
              <Link to="/transactions" className="sub-menu-button">Analyse et historique des transactions</Link>
            </div>
          </li>
          <li className="menu-section">
            <button className="menu-button">Configuration</button>
            <div className="sub-menu">
              <Link to="/manage-users" className="sub-menu-button">Gérer les comptes utilisateurs</Link>
              <Link to="/manage-tariffs" className="sub-menu-button">Gérer les tarifs</Link>
            </div>
          </li>
          <li>
            <Link to="/logout" className="menu-button logout-button">Déconnexion</Link>
          </li>
        </ul>
      </nav>
      <div className="create-client-container">
        <h1 className="page-title">Créer un client</h1>
        <form className="client-form">
          <div className="form-section">
            <h2>Case Details</h2>
            <TextField
              type="text"
              name="firstName"
              label="First Name"
              value={clientData.firstName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="lastName"
              label="Last Name"
              value={clientData.lastName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="date"
              name="dateOfBirth"
              label="Date of Birth"
              value={clientData.dateOfBirth}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <div className="form-section">
            <h2>Issue Details</h2>
            <TextField
              type="text"
              name="districtCity"
              label="District and City"
              value={clientData.districtCity}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="address"
              label="Address"
              value={clientData.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="phoneNumber"
              label="Phone Number"
              value={clientData.phoneNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="email"
              name="email"
              label="Email"
              value={clientData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="text"
              name="agent"
              label="Agent"
              value={clientData.agent}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              type="date"
              name="submissionDate"
              label="Submission Date"
              value={clientData.submissionDate}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="text"
              name="rfid"
              label="RFID"
              value={clientData.rfid}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <InputLabel id="plan-type-label">Plan Type</InputLabel>
            <Select
              labelId="plan-type-label"
              name="planType"
              value={clientData.planType}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </div>
          <Button variant="contained" color="primary" onClick={handleCreateClient} fullWidth>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;
