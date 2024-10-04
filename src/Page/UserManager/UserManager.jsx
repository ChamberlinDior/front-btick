import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Spin, message, Avatar, Tag, Form, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserManager.css';

const { Option } = Select;

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    role: '',
    uniqueUserNumber: '',
  });
  const navigate = useNavigate();

  // Fonction pour générer un numéro unique simple (AAA123, AAB123, etc.)
  const generateUniqueNumber = (existingNumbers) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lastCode = existingNumbers.length > 0 ? existingNumbers[existingNumbers.length - 1].substring(0, 3) : 'AAA';
    let numPart = parseInt(existingNumbers.length > 0 ? existingNumbers[existingNumbers.length - 1].substring(3) : '123');
    
    if (numPart >= 999) {
      // Si le numéro atteint 999, passer à la combinaison de lettres suivante
      let lastLetterIndex = letters.indexOf(lastCode[2]);
      if (lastLetterIndex === 25) {
        lastCode = lastCode.substring(0, 2) + letters[0];
        let secondLetterIndex = letters.indexOf(lastCode[1]);
        lastCode = lastCode[0] + letters[secondLetterIndex + 1] + lastCode[2];
      } else {
        lastCode = lastCode.substring(0, 2) + letters[lastLetterIndex + 1];
      }
      numPart = 123;
    } else {
      numPart += 1;
    }

    return `${lastCode}${numPart}`;
  };

  // Chargement initial des utilisateurs
  useEffect(() => {
    setLoading(true);
    axios.get('http://51.178.42.116:8085/api/utilisateurs')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        message.error("Erreur lors du chargement des utilisateurs");
        setLoading(false);
      });
  }, []);

  const fetchUserTransactions = (user) => {
    setLoadingTransactions(true);
    axios.get('http://51.178.42.116:8085/api/forfait-verifications', {
      params: { nomClient: user.nom, uniqueUserNumber: user.uniqueUserNumber }
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

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    fetchUserTransactions(user);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalVisible(false);
    setTransactions([]);
  };

  const handleRefresh = () => {
    setLoading(true);
    axios.get('http://51.178.42.116:8085/api/utilisateurs')
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

  const handleCreateUser = () => {
    const existingNumbers = users.map(user => user.uniqueUserNumber);
    const uniqueNumber = generateUniqueNumber(existingNumbers);
    const newUserWithUniqueNumber = { ...newUser, uniqueUserNumber: uniqueNumber };

    axios.post('http://51.178.42.116:8085/api/utilisateurs', newUserWithUniqueNumber)
      .then(response => {
        message.success("Utilisateur créé avec succès !");
        setUsers([...users, response.data]);
        setIsCreateModalVisible(false);
      })
      .catch(error => {
        message.error("Erreur lors de la création de l'utilisateur");
      });
  };

  const columns = [
    {
      title: 'ID Utilisateur',
      key: 'idUtilisateur',
      render: (text, record, index) => `0${index + 1}`, // Génération de l'ID Utilisateur (01, 02, etc.)
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

  return (
    <div className="usermanager-container">
      <div className="top-bar">
        <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au Menu Principal
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreateModalVisible(true)}>
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
        title="Créer un Utilisateur"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateUser}
      >
        <Form layout="vertical">
          <Form.Item label="Nom">
            <Input value={newUser.nom} onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} />
          </Form.Item>
          <Form.Item label="Prénom">
            <Input value={newUser.prenom} onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })} />
          </Form.Item>
          <Form.Item label="Rôle">
            <Select
              value={newUser.role}
              onChange={(value) => setNewUser({ ...newUser, role: value })}
              placeholder="Sélectionner un rôle"
            >
              <Option value="CASSIER">CASSIER</Option>
              <Option value="CHAUFFEUR">CHAUFFEUR</Option>
              <Option value="CONTROLEUR">CONTROLEUR</Option>
              <Option value="ADMIN">ADMIN</Option>
              <Option value="AUTRE">AUTRE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
