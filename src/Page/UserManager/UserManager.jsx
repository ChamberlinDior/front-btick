import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Table, message, Select, Avatar, Tag, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './UserManager.css';

const { Option } = Select;

const generateUniqueUserNumber = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14', '#ff6f61', '#42e6a4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const getColumnSearchProps = (dataIndex, searchInput, setSearchInput, handleSearch, handleReset) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8 }}>
      <Input
        ref={searchInput}
        placeholder={`Rechercher ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Button
        type="primary"
        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
        icon={<SearchOutlined />}
        size="small"
        style={{ width: 90, marginRight: 8 }}
      >
        Rechercher
      </Button>
      <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
        Réinitialiser
      </Button>
    </div>
  ),
  filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
});

const UserManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [form] = Form.useForm();
  const [searchInput, setSearchInput] = useState(null);
  const navigate = useNavigate();

  // Fetching user data from the backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/utilisateurs', { params: filter });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Erreur lors de la récupération des utilisateurs.");
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle creation of a new user
  const handleCreateUser = async (values) => {
    setLoading(true);
    try {
      const newUniqueUserNumber = generateUniqueUserNumber();
      const userWithUniqueNumber = { ...values, uniqueUserNumber: newUniqueUserNumber };
      const response = await axiosInstance.post('/utilisateurs', userWithUniqueNumber);
      setUsers([...users, response.data]);
      form.resetFields();
      setIsModalVisible(false);
      setLoading(false);
      message.success("Utilisateur créé avec succès !");
    } catch (error) {
      message.error("Erreur lors de la création de l'utilisateur.");
      setLoading(false);
    }
  };

  // Handle deletion of a user
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/utilisateurs/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setLoading(false);
      message.success("Utilisateur supprimé avec succès !");
    } catch (error) {
      message.error("Erreur lors de la suppression de l'utilisateur.");
      setLoading(false);
    }
  };

  // Fetch user transactions (Copied from GestionDeTransaction)
  const fetchUserTransactions = async (user) => {
    setLoadingTransactions(true);
    try {
      const response = await axiosInstance.get('/api/forfait-verifications', {
        params: {
          nomUtilisateur: user.nom,
          roleUtilisateur: user.role,
          uniqueUserNumber: user.uniqueUserNumber,
        },
      });
      const sortedTransactions = response.data.sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
      setTransactions(sortedTransactions);
      setLoadingTransactions(false);
    } catch (error) {
      message.error("Erreur lors de la récupération des transactions.");
      setLoadingTransactions(false);
    }
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchInput(selectedKeys[0]);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchInput('');
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
      ...getColumnSearchProps('uniqueUserNumber', searchInput, setSearchInput, handleSearch, handleReset),
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (text) => <span style={{ color: '#108ee9', fontWeight: 'bold' }}>{text}</span>,
      ...getColumnSearchProps('nom', searchInput, setSearchInput, handleSearch, handleReset),
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
      render: (text) => <span style={{ color: '#ff6f61', fontWeight: 'bold' }}>{text}</span>,
      ...getColumnSearchProps('prenom', searchInput, setSearchInput, handleSearch, handleReset),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Tag color="blue">{text}</Tag>,
      ...getColumnSearchProps('role', searchInput, setSearchInput, handleSearch, handleReset),
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
            onClick={() => setIsModalVisible(true)}
            className="edit-button"
          >
            Éditer
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
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
    { title: 'Statut', dataIndex: 'statutForfait', key: 'statutForfait' },
    { 
      title: 'Date', 
      dataIndex: 'dateVerification', 
      key: 'dateVerification', 
      render: (text) => new Date(text).toLocaleDateString('fr-FR') 
    },
    { 
      title: 'Heure', 
      dataIndex: 'dateVerification', 
      key: 'heureVerification', 
      render: (text) => new Date(text).toLocaleTimeString('fr-FR') 
    },
  ];

  const handleRefresh = () => {
    fetchUsers();
    message.success("Données mises à jour avec succès !");
  };

  return (
    <div className="usermanager-container">
      <div className="top-bar">
        <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au Menu Principal
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalVisible(true)}>
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
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateUser}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="role" label="Rôle" rules={[{ required: true }]}>
            <Select>
              <Option value="ADMIN">ADMIN</Option>
              <Option value="EMPLOYE">EMPLOYE</Option>
              <Option value="CHAUFFEUR">CHAUFFEUR</Option>
              <Option value="CONTROLEUR">CONTROLEUR</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">Créer</Button>
        </Form>
      </Modal>

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
