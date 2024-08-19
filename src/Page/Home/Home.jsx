import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Table, message, Card, Spin, Select, DatePicker, Avatar } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import './Home.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const getColor = (name) => {
  const colors = ['#87d068', '#108ee9', '#fadb14']; // Vert, Bleu, Jaune
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const Home = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [isRFIDModalVisible, setIsRFIDModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    fetchClients();
  }, [filter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/clients', { params: filter });
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      message.error("Erreur lors de la récupération des clients.");
      setLoading(false);
    }
  };

  const handleCreateClient = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/clients', values);
      setClients([...clients, response.data]);
      setIsModalVisible(false);
      setCurrentClient(response.data);
      setIsPreviewVisible(true);
      setLoading(false);
    } catch (error) {
      message.error("Erreur lors de la création du client.");
      setLoading(false);
    }
  };

  const handleAssignRFID = async (rfid) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/clients/${currentClient.id}/rfid`, rfid, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      const updatedClients = clients.map((client) =>
        client.id === currentClient.id ? { ...client, rfid: response.data.rfid } : client
      );
      setClients(updatedClients);
      setIsRFIDModalVisible(false);
      setLoading(false);
      message.success("RFID ajouté avec succès !");
    } catch (error) {
      message.error("Erreur lors de l'ajout du RFID.");
      setLoading(false);
    }
  };

  const isForfaitActif = (expirationDate) => {
    if (!expirationDate) return { active: false, formattedDate: 'N/A' };
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    const isActive = expDate > currentDate;
    const formattedDate = expDate.toLocaleDateString('fr-FR'); // Format JJ/MM/AAAA
    return { active: isActive, formattedDate };
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
    { title: 'Numéro Client', dataIndex: 'numClient', key: 'numClient' },
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
    { title: 'Quartier', dataIndex: 'quartier', key: 'quartier' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text) => `${text} XAF`,
    },
    {
      title: 'Forfait et Expiration',
      dataIndex: 'forfaitExpiration',
      key: 'forfaitExpiration',
      render: (text) => {
        const { active, formattedDate } = isForfaitActif(text);
        return (
          <span style={{ color: active ? 'green' : 'red' }}>
            {active ? `Actif jusqu'au ${formattedDate}` : 'Inactif'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setCurrentClient(record);
              setIsRFIDModalVisible(true);
            }}
          >
            Ajouter RFID
          </Button>
          <Button type="secondary" onClick={() => showProfileModal(record)}>
            Voir Profil
          </Button>
        </>
      ),
    },
  ];

  const handleFilterChange = (type, value) => {
    setFilter({ ...filter, [type]: value });
  };

  const showProfileModal = (client) => {
    setCurrentClient(client);
    setIsProfileModalVisible(true);
  };

  const renderCardPreview = () => {
    if (!currentClient) return null;

    return (
      <Card className="carte-preview" hoverable>
        <div className="card-content">
          <h3 className="card-title">Numéro: {currentClient.numClient}</h3>
          <p>
            <strong>Nom:</strong> {currentClient.nom}
          </p>
          <p>
            <strong>Prénom:</strong> {currentClient.prenom}
          </p>
          <p>
            <strong>Ville:</strong> {currentClient.ville}
          </p>
          <p>
            <strong>Date de Délivrance:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setIsModalVisible(true)}
        >
          Créer un Client
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchClients}
          loading={loading}
        >
          Rafraîchir
        </Button>
        <Select
          defaultValue="Tous"
          style={{ width: 120 }}
          onChange={(value) => handleFilterChange('status', value)}
        >
          <Option value="Tous">Tous</Option>
          <Option value="Actif">Actif</Option>
          <Option value="Inactif">Inactif</Option>
        </Select>
        <RangePicker
          onChange={(dates, dateStrings) => handleFilterChange('dates', dateStrings)}
        />
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={clients} columns={columns} rowKey="id" />
      )}
      <Modal
        title="Créer un Client"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateClient}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quartier" label="Quartier" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ville" label="Ville" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Créer
          </Button>
        </Form>
      </Modal>
      <Modal
        title="Aperçu de la Carte"
        visible={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={null}
      >
        {renderCardPreview()}
        <Button type="primary" onClick={() => window.print()}>
          Imprimer
        </Button>
      </Modal>
      <Modal
        title="Attribuer un RFID"
        visible={isRFIDModalVisible}
        onCancel={() => setIsRFIDModalVisible(false)}
        onOk={() => {
          handleAssignRFID(document.getElementById('rfid-input').value);
        }}
      >
        <Form>
          <Form.Item label="RFID">
            <Input id="rfid-input" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Profil du Client"
        visible={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
      >
        {currentClient && (
          <div className="client-profile">
            <Avatar size={64} style={{ backgroundColor: getColor(currentClient.nom) }}>
              {currentClient.nom.charAt(0).toUpperCase()}
            </Avatar>
            <h3>{currentClient.nom} {currentClient.prenom}</h3>
            <p><strong>Quartier:</strong> {currentClient.quartier}</p>
            <p><strong>Ville:</strong> {currentClient.ville}</p>
            <p><strong>RFID:</strong> {currentClient.rfid ? `${currentClient.rfid}` : 'Non attribué'}</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: currentClient.rfid ? 'green' : 'red',
                  marginRight: '10px'
                }}
              ></div>
              <span>{currentClient.rfid ? 'Carte Active' : 'Carte Inactive'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
