import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import './TransactionPage.css';

const TransactionPage = () => {
  const [clientInfo, setClientInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [forfaitHistory, setForfaitHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract clientId from the URL
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get('clientId');

  // Function to fetch client information based on clientId
  const fetchClientInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`);
      setClientInfo(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des informations du client.');
      setLoading(false);
    }
  }, [clientId]);

  // Function to fetch forfait history based on clientId
  const fetchForfaitHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/forfaits/historique/${clientId}`);
      if (response.data && Array.isArray(response.data)) {
        setForfaitHistory(response.data);
      } else {
        message.warning('Aucun forfait activé trouvé pour ce client.');
      }
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération de l\'historique des forfaits.');
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClientInfo();
      fetchForfaitHistory();  // Fetch forfait history on page load
    }
  }, [clientId, fetchClientInfo, fetchForfaitHistory]);

  const columns = [
    {
      title: 'ID Transaction',
      dataIndex: 'idTransaction',
      key: 'idTransaction',
      render: (text, record, index) => (index + 1).toString().padStart(2, '0'),  // Générer un ID avec format 01, 02, etc.
    },
    {
      title: 'Type de Forfait',
      dataIndex: 'typeForfait',
      key: 'typeForfait',
      render: (text) => {
        switch (text) {
          case 'jour':
            return 'Forfait Journalier';
          case 'semaine':
            return 'Forfait Hebdomadaire';
          case 'mois':
            return 'Forfait Mensuel';
          default:
            return text;
        }
      },
    },
    {
      title: 'Date d\'activation',
      dataIndex: 'dateActivation',
      key: 'dateActivation',
    },
    {
      title: 'Date d\'expiration',
      dataIndex: 'dateExpiration',
      key: 'dateExpiration',
    },
    {
      title: 'Numéro Client', // Remplacement de 'ID Client' par 'Numéro Client'
      dataIndex: 'numClient',
      key: 'numClient',
      render: () => clientInfo.numClient || 'N/A', // On affiche le numéro unique du client
    }
  ];

  return (
    <div className="transaction-page-container">
      <div className="top-bar">
        <Button
          type="primary"
          onClick={() => navigate(-1)}  // Retourner à la page précédente
          className="back-btn"
        >
          Retour
        </Button>
      </div>

      <h1>Historique des Transactions du Client</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={forfaitHistory}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered  // Ajout des lignes horizontales pour séparer les colonnes
        />
      )}
    </div>
  );
};

export default TransactionPage;
