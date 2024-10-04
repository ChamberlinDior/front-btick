import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Modal, Form, Select, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import './TerminalManager.css';

const { Option } = Select;

const TerminalManager = () => {
  const [terminals, setTerminals] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [currentMacAddress, setCurrentMacAddress] = useState(''); // Nouvel état pour stocker l'adresse MAC du terminal sélectionné
  const [form] = Form.useForm();
  const [filter, setFilter] = useState({});

  const navigate = useNavigate();

  // Fonction pour récupérer les terminaux
  const fetchTerminals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/terminals', { params: filter });
      setTerminals(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des terminaux.');
      setLoading(false);
    }
  }, [filter]);

  // Fonction pour récupérer les bus
  const fetchBuses = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/buses');
      setBuses(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des bus.');
    }
  }, []);

  useEffect(() => {
    fetchTerminals();
    fetchBuses();
  }, [fetchTerminals, fetchBuses]);

  // Fonction pour récupérer les transactions d'un terminal par son adresse MAC
  const fetchTransactions = async (macAddress) => {
    setLoadingTransactions(true);
    try {
      const response = await axiosInstance.get(`http://51.178.42.116:8085/api/forfait-verifications?macAddress=${macAddress}`);
      const filteredTransactions = response.data.filter(transaction => transaction.androidId === macAddress); // Filtrer par adresse MAC
      const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.dateVerification) - new Date(a.dateVerification));
      setTransactions(sortedTransactions);
      setLoadingTransactions(false);
      setCurrentMacAddress(macAddress); // Stocker l'adresse MAC actuelle pour la modal
      setIsTransactionModalVisible(true);
    } catch (error) {
      message.error('Erreur lors de la récupération des vérifications de forfait.');
      console.error("Erreur:", error);
      setLoadingTransactions(false);
    }
  };

  // Fonction pour créer un terminal
  const handleCreateTerminal = async (values) => {
    try {
      const response = await axiosInstance.post('/terminals/create', values);
      message.success('Terminal créé avec succès');
      setTerminals([...terminals, response.data]);
      setIsCreationModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de la création du terminal');
    }
  };

  // Fonction pour obtenir la matricule du bus lié à une adresse MAC
  const getBusMatricule = (macAddress) => {
    const bus = buses.find((bus) => bus.macAddress === macAddress);
    return bus ? bus.matricule : 'N/A';
  };

  // Fonction de recherche dans les colonnes
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
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  // Colonnes du tableau pour les terminaux
  const columns = [
    {
      title: 'ID Terminal',
      dataIndex: 'terminalId',
      key: 'terminalId',
      ...getColumnSearchProps('terminalId'),
    },
    {
      title: 'Type de Terminal',
      dataIndex: 'typeTerminal',
      key: 'typeTerminal',
      ...getColumnSearchProps('typeTerminal'),
    },
    {
      title: 'Adresse MAC',
      dataIndex: 'macAddress',
      key: 'macAddress',
      ...getColumnSearchProps('macAddress'),
    },
    {
      title: 'Matricule du Bus',
      dataIndex: 'macAddress',
      key: 'busMatricule',
      render: (macAddress) => getBusMatricule(macAddress),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Button onClick={() => fetchTransactions(record.macAddress)}>Voir Transactions</Button>
      ),
    },
  ];

  // Colonnes pour les transactions dans le modal (ordre mis à jour)
  const transactionColumns = [
    { title: 'ID Transaction', dataIndex: 'id', key: 'id' },
    {
      title: 'Date de Vérification',
      dataIndex: 'dateVerification',
      key: 'dateVerification',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Heure de Vérification',
      dataIndex: 'dateVerification',
      key: 'heureVerification',
      render: (text) => new Date(text).toLocaleTimeString(),
    },
    { title: 'Nom du Client', dataIndex: 'nomClient', key: 'nomClient' },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
    { title: 'Statut du Forfait', dataIndex: 'statutForfait', key: 'statutForfait' },
    {
      title: 'Nom du Terminal',
      dataIndex: 'androidId',
      key: 'androidId',
      render: (text) => (text === currentMacAddress ? 'Ter02' : 'Terminal'),
    },
    { title: 'Rôle Utilisateur', dataIndex: 'roleUtilisateur', key: 'roleUtilisateur' },
    { title: 'Nom de l\'Utilisateur', dataIndex: 'nomUtilisateur', key: 'nomUtilisateur' },
  ];

  return (
    <div className="terminalmanager-container">
      <div className="top-bar">
        <Button type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au menu principal
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreationModalVisible(true)}>
          Créer un Terminal
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={fetchTerminals} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
      </div>

      <div className="table-container">
        <Table
          dataSource={terminals}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          size="middle"
          style={{ backgroundColor: '#f0f2f5', borderRadius: '10px' }}
        />
      </div>

      {/* Modal pour afficher les transactions */}
      <Modal
        title="Transactions"
        visible={isTransactionModalVisible}
        onCancel={() => setIsTransactionModalVisible(false)}
        footer={null}
        width="90%"  // Le modal prend 90% de la largeur de l'écran
        bodyStyle={{ backgroundColor: 'rgba(0, 0, 255, 0.1)' }} // Arrière-plan bleu transparent
      >
        {loadingTransactions ? (
          <Spin size="large" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table
              dataSource={transactions}
              columns={transactionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
              style={{ width: '100%' }} // Le tableau prend 100% de la largeur
            />
          </div>
        )}
      </Modal>

      {/* Modal pour la création de terminal */}
      <Modal
        title="Créer un Terminal"
        visible={isCreationModalVisible}
        onCancel={() => setIsCreationModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateTerminal}>
          <Form.Item
            name="terminalId"
            label="ID Terminal"
            rules={[{ required: true, message: 'Veuillez entrer l\'ID du terminal' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="typeTerminal"
            label="Type de Terminal"
            rules={[{ required: true, message: 'Veuillez sélectionner le type de terminal' }]}
          >
            <Select placeholder="Sélectionner un type">
              <Option value="POS">POS</Option>
              <Option value="RFID">RFID</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="macAddress"
            label="Adresse MAC"
            rules={[{ required: true, message: 'Veuillez entrer l\'adresse MAC' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="busMatricule"
            label="Matricule du Bus (optionnel)"
          >
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

export default TerminalManager;
