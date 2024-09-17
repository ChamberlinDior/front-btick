import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Table, message, Spin, Select, DatePicker, Avatar } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import './Home.css';
import QRCode from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import RectoImage from '../../assets/TRANSURB-RECTO.png'; // Front side of card image
import VersoImage from '../../assets/TRANSURB-VERSO.png'; // Back side of card image
import moment from 'moment';

const { RangePicker } = DatePicker;

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14', '#ff6f61', '#42e6a4'];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const Home = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
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
      const clientWithRfid = { ...values };
      const response = await axiosInstance.post('/clients', clientWithRfid);
      setClients([...clients, response.data]);
      setCurrentClient(response.data);
      form.resetFields();
      setIsModalVisible(false);
      setIsPreviewVisible(true);
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
    navigate(`/transactions?clientId=${record.id}`);
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
        <Button type="secondary" onClick={() => showCardModal(record)}>
          Afficher Carte du Client
        </Button>
      ),
    },
  ];

  const showCardModal = (client) => {
    setCurrentClient(client);
    setIsPreviewVisible(true);
  };

  const renderCardPreview = () => {
    if (!currentClient) return null;

    const cardStyle = {
      width: '340px',
      height: '214px',
      borderRadius: '15px',
      border: '3px solid black',
      position: 'relative',
    };

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Front Side of the Card */}
        <div style={{ textAlign: 'center', position: 'relative', marginRight: '20px' }}>
          <h3>Recto de la Carte</h3>
          <img
            src={RectoImage}
            alt="Recto de la carte"
            style={cardStyle}
          />
          <div
            style={{
              position: 'absolute',
              top: '85px',
              left: '110px',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            {moment(currentClient.dateCreation).format('DD/MM/YYYY')}
          </div>
          <div
            style={{
              position: 'absolute',
              top: '102px',
              left: '110px',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {currentClient.nom.toLowerCase()} {currentClient.prenom.toLowerCase()}
          </div>
          <div
            style={{
              position: 'absolute',
              top: '85px',
              left: '30px',
            }}
          >
            <QRCode value={currentClient.rfid} size={70} level="H" />
          </div>
        </div>

        {/* Back Side of the Card */}
        <div style={{ textAlign: 'center' }}>
          <h3>Verso de la Carte</h3>
          <img
            src={VersoImage}
            alt="Verso de la carte"
            style={cardStyle}
          />
        </div>
      </div>
    );
  };

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
        <Button type="primary" onClick={() => navigate('/')} style={{ marginLeft: 8 }}>
          Gestion des Clients
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
      <Modal 
        title="Créer un Client" 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null}
        width="100vw" 
        bodyStyle={{ height: '100vh', padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Form form={form} onFinish={handleCreateClient} style={{ width: '100%', maxWidth: '600px' }}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="quartier" label="Quartier" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="ville" label="Ville" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="dateCreation" label="Date de Création" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" /></Form.Item>
          <Form.Item name="nomAgent" label="Nom de l'Agent" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="rfid" label="Numéro RFID" rules={[{ required: true }]}><Input /></Form.Item>
          <Button type="primary" htmlType="submit" block>Créer</Button>
        </Form>
      </Modal>
      <Modal 
        title="Aperçu de la Carte" 
        visible={isPreviewVisible} 
        onCancel={() => setIsPreviewVisible(false)} 
        footer={null}
        width="100vw" 
        bodyStyle={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {renderCardPreview()}
        <Button type="primary" onClick={() => window.print()} style={{ marginTop: '20px', display: 'block', margin: '0 auto' }}>Imprimer</Button>
      </Modal>
    </div>
  );
};

export default Home;
