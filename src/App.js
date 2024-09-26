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
import GestionDesCartes from './Page/GestionDesCartes/GestionDesCartes'; // Import du composant GestionDesCartes

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedUser, setConnectedUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Route vers la page de connexion */}
        <Route 
          path="/login" 
          element={<Login setIsAuthenticated={setIsAuthenticated} setConnectedUser={setConnectedUser} />} 
        />
        
        {/* Route vers la page d'accueil */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home connectedUser={connectedUser} /> : <Navigate to="/login" />}
        />

        {/* Route vers la page des transactions */}
        <Route
          path="/transactions"
          element={isAuthenticated ? <TransactionPage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des transactions */}
        <Route
          path="/gestion-transactions"
          element={isAuthenticated ? <GestionDeTransaction /> : <Navigate to="/login" />}
        />

        {/* Route vers la page de Carte Attachée */}
        <Route
          path="/carte-attache/:clientId"
          element={isAuthenticated ? <CarteAttachePage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des utilisateurs */}
        <Route
          path="/users"
          element={isAuthenticated ? <UserManager /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des bus */}
        <Route
          path="/bus-manager"
          element={isAuthenticated ? <BusManager /> : <Navigate to="/login" />}
        />

        {/* Route vers la page Profil de Client */}
        <Route
          path="/profil-client/:clientId"
          element={isAuthenticated ? <ProfilDeClient /> : <Navigate to="/login" />}
        />

        {/* Route vers la page d'affichage de la carte du client */}
        <Route
          path="/carte-client/:clientId"
          element={isAuthenticated ? <CarteClientPage /> : <Navigate to="/login" />}
        />

        {/* Route vers la gestion des cartes */}
        <Route
          path="/gestion-cartes"
          element={isAuthenticated ? <GestionDesCartes /> : <Navigate to="/login" />}
        />

        {/* Redirection par défaut vers la page de connexion */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
