import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { Button } from 'antd'; // Utilisation d'Ant Design pour les boutons
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import './ProfilDeClient.css';

const ProfilDeClient = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction pour récupérer les données du client
  const fetchClientData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`);
      setClient(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des informations du client.');
      setLoading(false);
    }
  };

  // Charger les données du client au chargement de la page
  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const handleShowCard = () => {
    navigate(`/carte-client/${clientId}`);
  };

  const handleShowHistory = () => {
    navigate(`/transactions?clientId=${clientId}`);
  };

  const handleRefresh = () => {
    fetchClientData();
    message.success('Données mises à jour avec succès !');
  };

  const clientData = client ? [
    { key: 'Numéro Client', value: client.numClient },
    { key: 'Nom', value: client.nom },
    { key: 'Prénom', value: client.prenom },
    { key: 'Quartier', value: client.quartier },
    { key: 'Ville', value: client.ville },
    { key: 'Date de Création', value: moment(client.dateCreation).format('DD/MM/YYYY') },
    { key: 'Nom de l\'Agent', value: client.nomAgent },
  ] : [];

  const columns = [
    { title: 'Champ', dataIndex: 'key', key: 'key', align: 'center' },
    { title: 'Valeur', dataIndex: 'value', key: 'value', align: 'center' }
  ];

  return (
    <div className="profil-container">
      {/* Navbar */}
      <div className="navbar">
        <Button type="primary" onClick={() => navigate('/')} style={{ marginRight: '10px' }}>
          Retour au menu principal
        </Button>
        <Button type="default" icon={<ReloadOutlined />} onClick={handleRefresh} style={{ marginRight: '10px' }}>
          Rafraîchir
        </Button>
        <Button type="primary" onClick={handleShowCard} style={{ marginRight: '10px' }}>
          Afficher Carte du Client
        </Button>
        <Button type="primary" onClick={handleShowHistory}>
          Voir Historique des Transactions
        </Button>
      </div>

      {/* Client Info Table */}
      {loading ? (
        <Spin size="large" />
      ) : (
        client && (
          <div className="client-content">
            <Table
              dataSource={clientData}
              columns={columns}
              pagination={false}
              bordered
              className="client-table"
            />
          </div>
        )
      )}
    </div>
  );
};

export default ProfilDeClient;
