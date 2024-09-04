import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Table, message, Card, Spin, Select, DatePicker, Avatar, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import './Home.css';
import QRCode from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const generateRFID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let rfid = '';
  for (let i = 0; i < 8; i++) {
    rfid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return rfid;
};

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
  const [isRFIDModalVisible, setIsRFIDModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [isFullScreenModalVisible, setIsFullScreenModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);

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
      const newRfid = generateRFID();
      const clientWithRfid = { ...values, rfid: newRfid };
      const response = await axiosInstance.post('/clients', clientWithRfid);
      setClients([...clients, response.data]);
      setCurrentClient(response.data);
      setIsModalVisible(false);
      setIsPreviewVisible(true);
      setLoading(false);
      handleRefresh();
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
      handleRefresh();
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
    const formattedDate = expDate.toLocaleDateString('fr-FR');
    return { active: isActive, formattedDate };
  };

  const handleDeactivateCard = async () => {
    if (!currentClient) return;

    try {
      await axiosInstance.put(`/clients/${currentClient.id}/deactivate`);
      message.success("Carte désactivée avec succès !");
      setCurrentClient({ ...currentClient, actif: false });
      handleRefresh();
    } catch (error) {
      message.error("Erreur lors de la désactivation de la carte.");
    }
  };

  const handleReactivateCard = async () => {
    if (!currentClient) return;

    try {
      await axiosInstance.put(`/clients/${currentClient.id}/reactivate`);
      message.success("Carte réactivée avec succès !");
      setCurrentClient({ ...currentClient, actif: true });
      handleRefresh();
    } catch (error) {
      message.error("Erreur lors de la réactivation de la carte.");
    }
  };

  const handleRowClick = (record) => {
    setCurrentClient(record);
    setIsFullScreenModalVisible(true);
  };

  const handleTransactionModalOpen = () => {
    setIsTransactionModalVisible(true);
  };

  const handleTransactionModalClose = () => {
    setIsTransactionModalVisible(false);
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
      title: 'RFID', 
      dataIndex: 'rfid', 
      key: 'rfid',
      ...getColumnSearchProps('rfid'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text) => `${text} XAF`,
      ...getColumnSearchProps('balance'),
      onCell: (record) => ({
        onClick: () => handleRowClick(record),
      }),
    },
    {
      title: 'Forfait et Expiration',
      dataIndex: 'forfaitExpiration',
      key: 'forfaitExpiration',
      render: (text, record) => {
        const { active, formattedDate } = isForfaitActif(record.forfaitExpiration);
        return (
          <span style={{ color: active ? 'green' : 'red' }}>
            {active ? `Actif jusqu'au ${formattedDate}` : 'Inactif'}
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
      width: '640px',  // Larger width for the card
      height: '400px',  // Larger height for the card, 4x original size
      borderRadius: '12px',
      padding: '30px',
      boxSizing: 'border-box',
    };

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '50%', padding: '20px' }}>
          <Card className="carte-preview" hoverable style={{ ...cardStyle }}>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <QRCode value={currentClient.rfid} size={150} level="H" style={{ marginLeft: '20px', marginTop: '20px' }} />
                <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '3rem', color: '#3b5998', marginRight: '20px' }}>
                  Trans'urb
                </div>
              </div>
              <div style={{ textAlign: 'left', marginTop: '20px', marginLeft: '20px' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>Nom: {currentClient.nom}</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>Prénom: {currentClient.prenom}</p>
              </div>
              <div style={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px' }}>
                
              </div>
              <div style={{ backgroundColor: '', padding: '15px 0', textAlign: 'center', color: '#FFF', fontSize: '1.5rem', borderRadius: '4px', marginTop: '10px', marginRight: '20px' }}>
               
              </div>
            </div>
          </Card>
        </div>

        <div style={{ width: '50%', padding: '20px' }}>
          <Card className="carte-preview" hoverable style={{ ...cardStyle, backgroundColor: '#007BFF' }}>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#FFF' }}>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>Prénom: Chamberlin dior</p>
              <p style={{ fontSize: '1.5rem', margin: '10px 0' }}>Date de Création: 8/22/2024</p>
              <div style={{ backgroundColor: '#28a745', padding: '15px 0', textAlign: 'center', color: '#FFF', fontSize: '1.5rem', borderRadius: '4px', marginTop: '20px', width: '100%' }}>
                CARTE DE TRANSPORT RECHARGEABLE
              </div>
            </div>
          </Card>
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
        <Button type="primary" onClick={() => {/* handle client management */}} style={{ marginLeft: 8 }}>
          Gestion des Clients
        </Button>
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginLeft: 8 }}>
          Gestion des Terminaux
        </Button>
        <Button type="primary" onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
          Gestion des Utilisateurs
        </Button>
        <Button type="primary" onClick={() => {/* handle card management */}} style={{ marginLeft: 8 }}>
          Gestion des Cartes
        </Button>
        <Button type="primary" onClick={() => setIsTransactionModalVisible(true)} style={{ marginLeft: 8 }}>
          Gestion des Transactions
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <RangePicker onChange={(dates, dateStrings) => setFilter({ dates: dateStrings })} style={{ marginLeft: 8 }} />
      </div>
      <div className="table-container">
        {loading ? <Spin size="large" /> : <Table dataSource={clients} columns={columns} rowKey="id" />}
      </div>
      <Modal 
        title="Créer un Client" 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null}
        width="100vw" 
        bodyStyle={{ height: '100vh', padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Form onFinish={handleCreateClient} style={{ width: '100%', maxWidth: '600px' }}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="quartier" label="Quartier" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="ville" label="Ville" rules={[{ required: true }]}><Input /></Form.Item>
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
      <Modal title="Attribuer un RFID" visible={isRFIDModalVisible} onCancel={() => setIsRFIDModalVisible(false)} onOk={() => {
        handleAssignRFID(document.getElementById('rfid-input').value);
      }}>
        <Form>
          <Form.Item label="RFID">
            <Input id="rfid-input" />
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={null}
        visible={isFullScreenModalVisible}
        onCancel={() => setIsFullScreenModalVisible(false)}
        footer={null}
        width="100vw"
        style={{ top: 0, left: 0, margin: 0, padding: 0, backgroundColor: '#1c1c1e' }}
        bodyStyle={{ height: '100vh', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}
      >
        {currentClient && (
          <div className="client-details" style={{ width: '80%', height: '90%', background: 'linear-gradient(135deg, #42e6a4, #007BFF)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={150} style={{ backgroundColor: getColor(currentClient.nom), fontSize: 64, marginBottom: 20 }}>
                {currentClient.nom.charAt(0).toUpperCase()}
              </Avatar>
              <h2 style={{ marginBottom: 10 }}>Numéro Client: {currentClient.numClient}</h2>
              <p style={{ fontSize: 18 }}><strong>RFID:</strong> {currentClient.rfid}</p>
              <p style={{ fontSize: 18 }}><strong>Nom:</strong> {currentClient.nom}</p>
              <p style={{ fontSize: 18 }}><strong>Prénom:</strong> {currentClient.prenom}</p>
              <p style={{ fontSize: 18 }}><strong>Date de Délivrance de la Carte:</strong> {new Date(currentClient.dateDelivrance).toLocaleDateString()}</p>
              <p style={{ fontSize: 18 }}><strong>Date de Pointage:</strong> {currentClient.datePointage ? new Date(currentClient.datePointage).toLocaleDateString() : 'N/A'}</p>
              <p style={{ fontSize: 18 }}><strong>Terminal Dernière Transaction:</strong> {currentClient.terminalDerniereTransaction}</p>
              <p style={{ fontSize: 18 }}><strong>Nom de l'Agent:</strong> {currentClient.agentDelivrance}</p>
              <p style={{ fontSize: 18 }}><strong>Statut:</strong> {currentClient.actif ? 'Actif' : <Tag color="red">Désactivé</Tag>}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button type="primary" style={{ fontSize: 18, padding: '10px 20px', borderRadius: 10 }} onClick={handleTransactionModalOpen}>
                Transactions
              </Button>
              {currentClient.actif ? (
                <Button type="primary" danger style={{ fontSize: 18, padding: '10px 20px', borderRadius: 10 }} onClick={handleDeactivateCard}>
                  Désactiver la Carte
                </Button>
              ) : (
                <Button type="primary" style={{ fontSize: 18, padding: '10px 20px', borderRadius: 10 }} onClick={handleReactivateCard}>
                  Réactiver la Carte
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Historique des Transactions"
        visible={isTransactionModalVisible}
        onCancel={handleTransactionModalClose}
        footer={null}
        width="80vw"
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <p>Transaction 1: Recharge 100 XAF</p>
        <p>Transaction 2: Recharge 500 XAF</p>
        <p>Transaction 3: Recharge 2500 XAF</p>
      </Modal>
    </div>
  );
};

export default Home;
