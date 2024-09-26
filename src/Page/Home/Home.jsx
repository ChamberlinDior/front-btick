import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Spin, DatePicker, Form, Modal } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { RangePicker } = DatePicker;

const Home = ({ connectedUser }) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal state
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/clients', { params: filter });
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Erreur lors de la récupération des clients.");
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleRefresh = () => {
    fetchClients();
    message.success("Données mises à jour avec succès !");
  };

  const handleCreateClient = async (values) => {
    setLoading(true);
    try {
      const clientWithAgent = {
        ...values,
        nomAgent: connectedUser?.nom || 'Agent inconnu',
      };

      const response = await axiosInstance.post('/clients', clientWithAgent);
      setClients([...clients, response.data]);
      form.resetFields();
      setIsModalVisible(false);
      setLoading(false);
      handleRefresh();
    } catch (error) {
      message.error("Erreur lors de la création du client.");
      setLoading(false);
    }
  };

  const isForfaitActif = (expirationDate) => {
    if (!expirationDate) return { active: false, formattedDate: 'N/A' };
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    const isActive = expDate > currentDate;
    const formattedDate = expDate.toLocaleDateString('fr-FR');
    return { active: isActive, formattedDate };
  };

  const handleRowClick = (record) => {
    navigate(`/profil-client/${record.id}`);
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
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
  });

  const columns = [
    {
      title: 'Numéro Client',
      dataIndex: 'numClient',
      key: 'numClient',
      ...getColumnSearchProps('numClient'),
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
      title: 'Quartier',
      dataIndex: 'quartier',
      key: 'quartier',
      ...getColumnSearchProps('quartier'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      ...getColumnSearchProps('ville'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Date de Création',
      dataIndex: 'dateCreation',
      key: 'dateCreation',
      render: (text) => (text ? new Date(text).toLocaleDateString('fr-FR') : 'N/A'),
      ...getColumnSearchProps('dateCreation'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Agent Créateur',
      dataIndex: 'nomAgent',
      key: 'nomAgent',
      ...getColumnSearchProps('nomAgent'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Expiration de Forfait',
      dataIndex: 'forfaitExpiration',
      key: 'forfaitExpiration',
      render: (text, record) => {
        const { active, formattedDate } = isForfaitActif(record.forfaitExpiration);
        return (
          <span style={{ color: active ? 'green' : 'red' }}>
            {formattedDate}
          </span>
        );
      },
      ...getColumnSearchProps('forfaitExpiration'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="secondary" onClick={() => handleRowClick(record)}>
          Voir Transactions
        </Button>
      ),
    },
  ];

  return (
    <div className="home-container">
      <div className="top-bar">
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalVisible(true)}>
          Créer un Client
        </Button>
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginLeft: 8 }}>
          Gestion des Trajets
        </Button>
        <Button type="primary" onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
          Gestion des Utilisateurs
        </Button>
        <Button type="primary" onClick={() => navigate('/gestion-cartes')} style={{ marginLeft: 8 }}>
          Gestion des Cartes
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <Button type="primary" onClick={() => navigate('/gestion-transactions')} style={{ marginLeft: 8 }}>
          Gestion des Transactions
        </Button>
        <RangePicker onChange={(dates, dateStrings) => setFilter({ dates: dateStrings })} style={{ marginLeft: 8 }} />
      </div>

      <div className="table-container">
        {loading ? <Spin size="large" /> : <Table dataSource={clients} columns={columns} rowKey="id" bordered pagination={{ pageSize: 10 }} size="middle" style={{ backgroundColor: '#f0f2f5', borderRadius: '10px' }} />}
      </div>

      {/* Modal pour créer un client */}
      <Modal
        title="Créer un Client"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateClient}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est obligatoire' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Le prénom est obligatoire' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quartier" label="Quartier" rules={[{ required: true, message: 'Le quartier est obligatoire' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ville" label="Ville" rules={[{ required: true, message: 'La ville est obligatoire' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateCreation" label="Date de Création" rules={[{ required: true, message: 'La date est obligatoire' }]}>
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="rfid" label="Numéro RFID" rules={[{ required: true, message: 'Le numéro RFID est obligatoire' }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Créer
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Home;
