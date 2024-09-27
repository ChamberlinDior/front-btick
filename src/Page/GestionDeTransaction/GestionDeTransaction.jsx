import React, { useEffect, useState } from 'react';
import { Button, Table, Spin, message } from 'antd';
import { ReloadOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GestionDeTransaction.css'; 

const GestionDeTransaction = () => {
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Pour naviguer entre les pages

  // Récupérer toutes les vérifications de forfaits depuis le backend
  useEffect(() => {
    setLoading(true);
    axios.get('http://51.178.42.116:8089/api/forfait-verifications')
      .then(response => {
        // Trier les transactions par date, de la plus récente à la plus ancienne
        const sortedForfaits = response.data.sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
        setForfaits(sortedForfaits);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        message.error("Erreur lors du chargement des vérifications de forfaits");
        console.error("Erreur:", error);
        setLoading(false);
      });
  }, []);

  // Rafraîchir les données de vérification de forfaits
  const handleRefresh = () => {
    setLoading(true);
    axios.get('http://51.178.42.116:8089/api/forfait-verifications')
      .then(response => {
        const sortedForfaits = response.data.sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
        setForfaits(sortedForfaits);
        setLoading(false);
        message.success("Vérifications mises à jour avec succès !");
      })
      .catch(error => {
        setError(error);
        message.error("Erreur lors de la mise à jour des vérifications");
        console.error("Erreur:", error);
        setLoading(false);
      });
  };

  return (
    <div className="gestion-forfait-page">
      {/* Navbar */}
      <div className="top-bar">
        <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/create-client')}>
          Créer un Client
        </Button>
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginLeft: 8 }}>
          Gestion des Trajets
        </Button>
        <Button type="primary" onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
          Gestion des Utilisateurs
        </Button>
        <Button type="primary" onClick={() => navigate('/')} style={{ marginLeft: 8 }}>
          Gestion des Clients
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => navigate('/home')} style={{ marginLeft: 8 }}>
          Retour
        </Button>
      </div>

      {/* Afficher un message si une erreur survient */}
      {error && <div className="error-message">Erreur : {error.message}</div>}

      {/* Tableau des vérifications de forfaits */}
      <div className="table-container">
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={forfaits}
            columns={[
              { title: 'ID Transaction', dataIndex: 'id', key: 'id' }, // Colonne pour l'identifiant unique
              { title: 'Nom du Client', dataIndex: 'nomClient', key: 'nomClient' },
              { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
              { title: 'Statut du Forfait', dataIndex: 'statutForfait', key: 'statutForfait' },
              { title: 'Nom du Terminal', dataIndex: 'androidId', key: 'androidId', render: () => 'Terminal 4' },
              { title: 'Rôle Utilisateur', dataIndex: 'roleUtilisateur', key: 'roleUtilisateur' },
              { title: 'Nom de l\'Utilisateur', dataIndex: 'nomUtilisateur', key: 'nomUtilisateur' },
              { 
                title: 'Date de Vérification', 
                dataIndex: 'dateVerification', 
                key: 'dateVerification', 
                render: text => new Date(text).toLocaleDateString() 
              },
              { 
                title: 'Heure de Vérification', 
                dataIndex: 'dateVerification', 
                key: 'heureVerification', 
                render: text => new Date(text).toLocaleTimeString() 
              },
            ]}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </div>
    </div>
  );
};

export default GestionDeTransaction;
