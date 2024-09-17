import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin, Divider, Modal, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig'; 
import { useNavigate, useLocation } from 'react-router-dom';
import './TransactionPage.css';  // Corrected CSS file import

const TransactionPage = () => {
  const [clientInfo, setClientInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [forfaitHistory, setForfaitHistory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract clientId from the URL
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get('clientId');

  // Function to fetch client information based on clientId
  const fetchClientInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`); // Fetch client data
      setClientInfo(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des informations du client.');
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClientInfo(); // Load client info
    }
  }, [clientId, fetchClientInfo]);

  const handleRefresh = () => {
    fetchClientInfo();
    message.success('Données mises à jour avec succès!');
  };

  // Function to fetch forfait history based on clientId
  const handleShowHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/forfaits/historique/${clientId}`); // Fetch forfait history
      if (response.data && Array.isArray(response.data)) {
        setForfaitHistory(response.data);
        setIsModalVisible(true);
      } else {
        message.warning('Aucun forfait activé trouvé pour ce client.');
      }
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération de l\'historique des forfaits.');
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A'; // Handle invalid date
    return date.toLocaleDateString('fr-FR');
  };

  const columns = [
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
      render: (text) => formatDate(text),
    },
    {
      title: 'Date d\'expiration',
      dataIndex: 'dateExpiration',
      key: 'dateExpiration',
      render: (text) => formatDate(text),
    },
    {
      title: 'ID Client',
      dataIndex: 'clientId',
      key: 'clientId',
    }
  ];

  return (
    <div className="client-profile-container">
      <div className="top-bar">
        <Button
          icon={<ReloadOutlined />}
          type="default"
          onClick={handleRefresh}
          className="refresh-btn"
        >
          Rafraîchir
        </Button>
        <Button
          type="primary"
          onClick={() => navigate('/home')}
          className="back-btn"
        >
          Retour à l'Accueil
        </Button>
      </div>

      <div className="client-info-section">
        <h1>Informations du Client</h1>
        {loading ? (
          <Spin size="large" />
        ) : (
          <div>
            <div className="client-details-grid">
              <div className="profile-left">
                <div className="client-avatar">
                  <div className="initial-avatar">
                    {clientInfo.nom && clientInfo.nom.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="client-main-info">
                  <p className="title">Nom:</p>
                  <p>{clientInfo.nom}</p>
                  <p className="title">Prénom:</p>
                  <p>{clientInfo.prenom}</p>
                </div>
              </div>

              <Divider className="green-divider" />

              <div className="profile-right">
                <p className="title">Numéro du Client:</p>
                <p>{clientInfo.numClient}</p>
                <p className="title">Quartier:</p>
                <p>{clientInfo.quartier}</p>
                <p className="title">Ville:</p>
                <p>{clientInfo.ville}</p>
              </div>
            </div>

            <div className="button-section">
              <Button type="primary" className="action-btn" onClick={() => navigate(`/carte-attache/${clientId}`)}>
                Carte Attachée
              </Button>
              <Button type="default" className="action-btn" onClick={() => navigate(`/nouvelle-carte/${clientId}`)}>
                Nouvelle Carte
              </Button>
              <Button type="default" className="action-btn" onClick={handleShowHistory}>
                Historique des Forfaits
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Historique des Forfaits Activés"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="80vw"
      >
        <Table
          dataSource={forfaitHistory}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      </Modal>
    </div>
  );
};

export default TransactionPage;
