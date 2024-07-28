import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo-container">
          <img 
            src="https://flyclipart.com/thumb2/autobus-bus-charabanc-motorbus-motorcoach-passenger-vehicle-588795.png" 
            alt="Trans'urb Logo" 
            className="logo" 
          />
        </div>
        <ul className="nav-links">
          <li><Link to="/" className="nav-item">Accueil</Link></li>
          <li><Link to="/create-client" className="nav-item">Créer un client</Link></li>
          <li><Link to="/list-clients" className="nav-item">Clients existants</Link></li>
          <li><Link to="/list-cards" className="nav-item">Gestions des cartes</Link></li>
          <li><Link to="/transactions" className="nav-item">Analyse et historique</Link></li>
          <li><Link to="/manage-users" className="nav-item">Gérer les utilisateurs</Link></li>
          <li><Link to="/manage-tariffs" className="nav-item">Gérer les tarifs</Link></li>
          <li><Link to="/update-client-data" className="nav-item">Mise à jour</Link></li>
          <li><Link to="/receive-recharges" className="nav-item">Réception des recharges</Link></li>
          <li><Link to="/manage-client-accounts" className="nav-item">Gestions des comptes clients</Link></li>
          <li><Link to="/consult-transactions" className="nav-item">Consultation transactions</Link></li>
        </ul>
        <Link to="/logout" className="nav-item logout-button">Déconnexion</Link>
      </div>
    </nav>
  );
};
