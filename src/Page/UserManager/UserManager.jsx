import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Spin, message, Avatar, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserManager.css';

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14', '#ff6f61', '#42e6a4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Récupération des utilisateurs depuis l'API
  useEffect(() => {
    setLoading(true);
    axios.get('http://192.168.1.79:8080/api/utilisateurs')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        message.error("Erreur lors du chargement des utilisateurs");
        setLoading(false);
      });
  }, []);

  // Récupération des transactions pour un utilisateur spécifique
  const fetchUserTransactions = (user) => {
    setLoadingTransactions(true);
    axios.get('http://192.168.1.79:8080/api/forfait-verifications', {
      params: { nomClient: user.nom, uniqueUserNumber: user.uniqueUserNumber } // Filtrer par nom et numéro utilisateur unique
    })
      .then(response => {
        const sortedTransactions = response.data.sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
        setTransactions(sortedTransactions);
        setLoadingTransactions(false);
      })
      .catch(error => {
        setError(error);
        message.error("Erreur lors du chargement des transactions");
        setLoadingTransactions(false);
      });
  };

  // Ouverture du modal pour afficher les détails d'un utilisateur
  const handleShowDetails = (user) => {
    setSelectedUser(user);
    fetchUserTransactions(user);  // Récupérer uniquement les transactions de cet utilisateur
    setIsDetailModalVisible(true);
  };

  // Fermeture du modal de détails
  const handleCloseDetails = () => {
    setIsDetailModalVisible(false);
    setTransactions([]);
  };

  // Rafraîchissement de la liste des utilisateurs
  const handleRefresh = () => {
    setLoading(true);
    axios.get('http://192.168.1.79:8080/api/utilisateurs')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
        message.success("Données mises à jour avec succès !");
      })
      .catch(error => {
        message.error("Erreur lors de la mise à jour des utilisateurs");
        setLoading(false);
      });
  };

  const columns = [
    {
      title: 'Profil',
      dataIndex: 'nom',
      key: 'avatar',
      render: (text, record) => (
        <Avatar style={{ backgroundColor: getColor(record.nom) }}>
          {record.nom.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Numéro Utilisateur',
      dataIndex: 'uniqueUserNumber',
      key: 'uniqueUserNumber',
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Date de Création',
      dataIndex: 'dateCreation',
      key: 'dateCreation',
      render: (text) => new Date(text).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className="action-buttons">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleShowDetails(record)}
            className="details-button"
          >
            Détails
          </Button>
          <Button
            icon={<EditOutlined />}
            className="edit-button"
          >
            Éditer
          </Button>
          <Button
            icon={<DeleteOutlined />}
            className="delete-button"
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const transactionsColumns = [
    { title: 'ID Transaction', dataIndex: 'id', key: 'id' }, 
    { title: 'Nom du Client', dataIndex: 'nomClient', key: 'nomClient' },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
    { title: 'Statut du Forfait', dataIndex: 'statutForfait', key: 'statutForfait' },
    { 
      title: 'Nom du Terminal', 
      dataIndex: 'androidId', 
      key: 'androidId',
      render: (text) => text === '67404a359fea20a2' ? 'Terminal 1' : 'Terminal'
    }, 
    { title: 'Rôle Utilisateur', dataIndex: 'roleUtilisateur', key: 'roleUtilisateur' },
    { title: 'Nom de l\'Utilisateur', dataIndex: 'nomUtilisateur', key: 'nomUtilisateur' },
    { 
      title: 'Date de Vérification', 
      dataIndex: 'dateVerification', 
      key: 'dateVerification', 
      render: text => new Date(text).toLocaleDateString('fr-FR') 
    },
    { 
      title: 'Heure de Vérification', 
      dataIndex: 'dateVerification', 
      key: 'heureVerification', 
      render: text => new Date(text).toLocaleTimeString('fr-FR') 
    },
  ];

  return (
    <div className="usermanager-container">
      <div className="top-bar">
        <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au Menu Principal
        </Button>
        <Button icon={<PlusOutlined />} type="primary">
          Créer un Utilisateur
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
      </div>

      <div className="table-container">
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
            size="middle"
            style={{ backgroundColor: '#2563eb', borderRadius: '10px', color: '#fff' }}
          />
        )}
      </div>

      <Modal
        title={`Transactions de ${selectedUser?.nom}`}
        visible={isDetailModalVisible}
        onCancel={handleCloseDetails}
        footer={null}
        width="80%"
      >
        {loadingTransactions ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={transactions}
            columns={transactionsColumns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserManager;
