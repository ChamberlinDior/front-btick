import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Table, message, Select, Avatar, Tag, DatePicker, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './UserManager.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const generateUniqueUserNumber = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14', '#ff6f61', '#42e6a4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const UserManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  
  const navigate = useNavigate();

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

  const handleCreateUser = async (values) => {
    setLoading(true);
    try {
      const newUniqueUserNumber = generateUniqueUserNumber();
      const userWithUniqueNumber = { ...values, uniqueUserNumber: newUniqueUserNumber };
      const response = await axiosInstance.post('/utilisateurs', userWithUniqueNumber);
      setUsers([...users, response.data]);
      setIsModalVisible(false);
      setLoading(false);
      message.success("Utilisateur créé avec succès !");
    } catch (error) {
      message.error("Erreur lors de la création de l'utilisateur.");
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    setCurrentUser(record);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Rechercher ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Rechercher
        </Button>
        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
          Réinitialiser
        </Button>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
  });

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
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    { 
      title: 'Numéro Utilisateur', 
      dataIndex: 'uniqueUserNumber', 
      key: 'uniqueUserNumber',
      ...getColumnSearchProps('uniqueUserNumber'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    { 
      title: 'Nom', 
      dataIndex: 'nom', 
      key: 'nom',
      ...getColumnSearchProps('nom'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    { 
      title: 'Prénom', 
      dataIndex: 'prenom', 
      key: 'prenom',
      ...getColumnSearchProps('prenom'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    { 
      title: 'Rôle', 
      dataIndex: 'role', 
      key: 'role',
      render: (text) => <Tag color="blue">{text}</Tag>,
      ...getColumnSearchProps('role'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Date de Création',
      dataIndex: 'dateCreation',
      key: 'dateCreation',
      render: (text) => new Date(text).toLocaleDateString('fr-FR'),
    },
  ];

  const handleRefresh = () => {
    fetchUsers();
    message.success("Données mises à jour avec succès !");
  };

  return (
    <div className="usermanager-container">
      <div className="top-bar">
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalVisible(true)}>
          Créer un Utilisateur
        </Button>
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginLeft: 8 }}>
          Gestion des Terminaux
        </Button>
        <Button type="primary" onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
          Gestion des Utilisateurs
        </Button>
        <Button type="primary" onClick={() => navigate('/')} style={{ marginLeft: 8 }}>
          Gestion des Clients
        </Button>
        <Button type="primary" onClick={() => {/* handle card management */}} style={{ marginLeft: 8 }}>
          Gestion des Cartes
        </Button>
        <Button type="primary" onClick={() => {/* handle transaction management */}} style={{ marginLeft: 8 }}>
          Gestion des Transactions
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <RangePicker onChange={(dates, dateStrings) => setFilter({ dates: dateStrings })} style={{ marginLeft: 8 }} />
      </div>
      <div className="table-container">
        {loading ? <Spin size="large" /> : <Table dataSource={users} columns={columns} rowKey="id" />}
      </div>
      <Modal
        title="Créer un Utilisateur"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateUser}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="role" label="Rôle" rules={[{ required: true }]}>
            <Select>
              <Option value="ADMIN">ADMIN</Option>
              <Option value="EMPLOYE">EMPLOYE</Option>
              <Option value="CHAUFFEUR">CHAUFFEUR</Option>
              <Option value="CONTROLEUR">CONTROLEUR</Option>
              <Option value="CAISSIER">CAISSIER</Option>
              <Option value="SUPERVISEUR">SUPERVISEUR</Option>
              <Option value="TECHNICIEN">TECHNICIEN</Option>
              <Option value="AGENT_DE_BILLETERIE">AGENT DE BILLETERIE</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">Créer</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
