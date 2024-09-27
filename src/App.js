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
  // Par défaut, l'utilisateur est considéré comme connecté
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Change from false to true
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
          element={<Home connectedUser={connectedUser} />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la page des transactions */}
        <Route
          path="/transactions"
          element={<TransactionPage />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la gestion des transactions */}
        <Route
          path="/gestion-transactions"
          element={<GestionDeTransaction />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la page de Carte Attachée */}
        <Route
          path="/carte-attache/:clientId"
          element={<CarteAttachePage />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la gestion des utilisateurs */}
        <Route
          path="/users"
          element={<UserManager />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la gestion des bus */}
        <Route
          path="/bus-manager"
          element={<BusManager />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la page Profil de Client */}
        <Route
          path="/profil-client/:clientId"
          element={<ProfilDeClient />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la page d'affichage de la carte du client */}
        <Route
          path="/carte-client/:clientId"
          element={<CarteClientPage />} // Suppression de la vérification de isAuthenticated
        />

        {/* Route vers la gestion des cartes */}
        <Route
          path="/gestion-cartes"
          element={<GestionDesCartes />} // Suppression de la vérification de isAuthenticated
        />

        {/* Redirection par défaut vers la page d'accueil si l'utilisateur est connecté */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
