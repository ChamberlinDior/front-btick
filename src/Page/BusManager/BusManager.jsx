import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Table, message, DatePicker } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './BusManager.css';

const { RangePicker } = DatePicker;

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14', '#ff6f61', '#42e6a4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const BusManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});

  const navigate = useNavigate();

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/buses', { params: filter });
      setBuses(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Erreur lors de la récupération des bus.");
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleCreateBus = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/buses', values);
      setBuses([...buses, response.data]);
      setIsModalVisible(false);
      setLoading(false);
      message.success("Bus créé avec succès !");
    } catch (error) {
      message.error("Erreur lors de la création du bus.");
      setLoading(false);
    }
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
      title: 'Modèle',
      dataIndex: 'modele',
      key: 'modele',
      ...getColumnSearchProps('modele'),
    },
    {
      title: 'Immatriculation',
      dataIndex: 'matricule',
      key: 'matricule',
      ...getColumnSearchProps('matricule'),
    },
    {
      title: 'Marque',
      dataIndex: 'marque',
      key: 'marque',
      ...getColumnSearchProps('marque'),
    },
    {
      title: 'Dernière Destination',
      dataIndex: 'lastDestination', 
      key: 'lastDestination',
      ...getColumnSearchProps('lastDestination'),
    },
    {
      title: 'Nom du Chauffeur',
      dataIndex: 'chauffeurNom',
      key: 'chauffeurNom',
      ...getColumnSearchProps('chauffeurNom'),
    },
    {
      title: 'Numéro Unique du Chauffeur',
      dataIndex: 'chauffeurUniqueNumber',
      key: 'chauffeurUniqueNumber',
      ...getColumnSearchProps('chauffeurUniqueNumber'),
    },
    {
      title: 'Début du Trajet',
      dataIndex: 'debutTrajet',
      key: 'debutTrajet',
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
    },
    {
      title: 'Fin du Trajet',
      dataIndex: 'finTrajet',
      key: 'finTrajet',
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
    },
  ];

  const handleRefresh = () => {
    fetchBuses();
    message.success("Données mises à jour avec succès !");
  };

  return (
    <div className="busmanager-container">
      <div className="top-bar">
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsModalVisible(true)}>
          Créer un Bus
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
        <Table
          dataSource={buses}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </div>
      <Modal
        title="Créer un Bus"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateBus}>
          <Form.Item name="modele" label="Modèle" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="matricule" label="Immatriculation" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="marque" label="Marque" rules={[{ required: true }]}><Input /></Form.Item>
          <Button type="primary" htmlType="submit">Créer</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default BusManager;
