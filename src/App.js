import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Page/Home/Home';
import UserManager from './Page/UserManager/UserManager';
import Login from './Page/Login/Login';
import BusManager from './Page/BusManager/BusManager';
import TransactionPage from './Page/Transaction/TransactionPage';
import CarteAttachePage from './Page/CarteAttache/CarteAttachePage';
import GestionDeTransaction from './Page/GestionDeTransaction/GestionDeTransaction';
import ProfilDeClient from './Page/ProfilDeClient/ProfilDeClient';
import CarteClientPage from './Page/CarteClientPage/CarteClientPage';
import GestionDesCartes from './Page/GestionDesCartes/GestionDesCartes';
import TerminalManager from './Page/TerminalManager/TerminalManager';
import TrajetHistory from './Page/TrajetHistory/TrajetHistory';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // L'utilisateur commence non connecté
  const [connectedUser, setConnectedUser] = useState(null); // Stocker les infos de l'utilisateur connecté

  return (
    <Router>
      <Routes>
        {/* Route vers la page de connexion */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} setConnectedUser={setConnectedUser} />}
        />

        {/* Route vers la page d'accueil (protégée, nécessite l'authentification) */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home connectedUser={connectedUser} /> : <Navigate to="/login" />}
        />

        {/* Route vers la page des transactions (protégée) */}
        <Route
          path="/transactions"
          element={isAuthenticated ? <TransactionPage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des transactions (protégée) */}
        <Route
          path="/gestion-transactions"
          element={isAuthenticated ? <GestionDeTransaction /> : <Navigate to="/login" />}
        />

        {/* Route vers la page de Carte Attachée (protégée) */}
        <Route
          path="/carte-attache/:clientId"
          element={isAuthenticated ? <CarteAttachePage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des utilisateurs (protégée) */}
        <Route
          path="/users"
          element={isAuthenticated ? <UserManager /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des bus (protégée) */}
        <Route
          path="/bus-manager"
          element={isAuthenticated ? <BusManager /> : <Navigate to="/login" />}
        />

        {/* Route vers la page Profil de Client (protégée) */}
        <Route
          path="/profil-client/:clientId"
          element={isAuthenticated ? <ProfilDeClient /> : <Navigate to="/login" />}
        />

        {/* Route vers la page d'affichage de la carte du client (protégée) */}
        <Route
          path="/carte-client/:clientId"
          element={isAuthenticated ? <CarteClientPage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des cartes (protégée) */}
        <Route
          path="/gestion-cartes"
          element={isAuthenticated ? <GestionDesCartes /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des terminaux (protégée) */}
        <Route
          path="/gestion-terminaux"
          element={isAuthenticated ? <TerminalManager /> : <Navigate to="/login" />}
        />

        {/* Route vers l'historique des trajets (protégée) */}
        <Route
          path="/trajet-history/:macAddress"
          element={isAuthenticated ? <TrajetHistory /> : <Navigate to="/login" />}
        />

        {/* Redirection par défaut vers la page d'accueil si l'utilisateur est connecté, sinon vers login */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
