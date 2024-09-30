import React, { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Form, Select } from 'antd';
import { ReloadOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Utilisation de axios pour les appels backend
import './TerminalManager.css';

const { Option } = Select;

const TerminalManager = () => {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);
  const [forfaitVerifications, setForfaitVerifications] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch terminals data from the backend
  const fetchTerminals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://51.178.42.116:8089/api/buses');
      const terminalsData = response.data.map((terminal, index) => ({
        ...terminal,
        terminalName: `Terminal ${index + 1}`,
      }));
      setTerminals(terminalsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching terminals: ", error);
      message.error("Erreur lors de la récupération des terminaux.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminals();
  }, []);

  // Fetch Forfait Verifications by macAddress (androidId)
  const fetchForfaitVerifications = async (macAddress) => {
    setLoadingVerifications(true);
    try {
      const response = await axios.get(`http://51.178.42.116:8089/api/forfait-verifications?androidId=${macAddress}`);
      const sortedVerifications = response.data.map((item, index) => ({
        ...item,
        uniqueNumber: String(index + 1).padStart(2, '0'), // Générer un numéro unique commençant par 01
      }));
      setForfaitVerifications(sortedVerifications);
      setLoadingVerifications(false);
    } catch (error) {
      console.error("Error fetching verifications: ", error);
      message.error("Erreur lors de la récupération des vérifications de forfait.");
      setLoadingVerifications(false);
    }
  };

  // Reload terminal data
  const handleReload = () => {
    fetchTerminals();
  };

  // Function to handle terminal creation
  const handleCreateTerminal = async (values) => {
    const terminalNumber = terminals.length + 1; // Calculate next terminal number
    const newTerminalName = `Terminal ${terminalNumber}`;
    const newTerminal = {
      macAddress: values.macAddress,
      typeTerminal: values.typeTerminal,
      terminalName: newTerminalName,
    };

    try {
      await axios.post('http://51.178.42.116:8089/api/terminals/create', newTerminal);
      message.success(`Terminal ${newTerminalName} créé avec succès`);
      setTerminals([...terminals, newTerminal]);
      setIsCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating terminal: ", error);
      message.error("Erreur lors de la création du terminal.");
    }
  };

  // Function to handle terminal deletion
  const handleDeleteTerminal = async (macAddress) => {
    try {
      await axios.delete(`http://51.178.42.116:8089/api/buses/${macAddress}`);
      setTerminals(terminals.filter((terminal) => terminal.macAddress !== macAddress));
      message.success("Terminal supprimé avec succès.");
    } catch (error) {
      console.error("Error deleting terminal: ", error);
      message.error("Erreur lors de la suppression du terminal.");
    }
  };

  // Show the verification history modal for selected terminal
  const handleViewVerificationHistory = (terminal) => {
    setSelectedTerminal(terminal);
    fetchForfaitVerifications(terminal.macAddress); // Fetch verifications based on macAddress (androidId)
    setIsVerificationModalVisible(true);
  };

  // Close the verification modal
  const handleCloseVerificationModal = () => {
    setIsVerificationModalVisible(false);
    setForfaitVerifications([]); // Clear data when closing
  };

  const renderBatteryIcon = (niveauBatterie, isCharging) => {
    let color = 'green';
    if (niveauBatterie <= 25) {
      color = 'red';
    } else if (niveauBatterie <= 50) {
      color = 'orange';
    } else if (niveauBatterie <= 75) {
      color = 'yellow';
    }

    return (
      <span style={{ color }}>
        {isCharging ? '⚡' : '🔋'} {niveauBatterie}%
      </span>
    );
  };

  const columns = [
    {
      title: 'Nom du Terminal',
      dataIndex: 'terminalName',
      key: 'terminalName',
    },
    {
      title: 'Type de Terminal',
      dataIndex: 'typeTerminal',
      key: 'typeTerminal',
      render: (text) => text || 'Type inconnu',
    },
    {
      title: 'Niveau de Batterie',
      dataIndex: 'niveauBatterie',
      key: 'niveauBatterie',
      render: (niveauBatterie, record) => renderBatteryIcon(niveauBatterie, record.isCharging),
    },
    {
      title: 'En Charge',
      dataIndex: 'isCharging',
      key: 'isCharging',
      render: (isCharging) => (isCharging ? 'Oui' : 'Non'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleViewVerificationHistory(record)}>
            Historique de Pointage
          </Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteTerminal(record.macAddress)}>
            Supprimer
          </Button>
        </>
      ),
    },
  ];

  const verificationColumns = [
    { title: 'N° Pointage', dataIndex: 'uniqueNumber', key: 'uniqueNumber' }, // Ajout du numéro unique
    { title: 'Nom du Client', dataIndex: 'nomClient', key: 'nomClient' },
    { title: 'RFID', dataIndex: 'rfid', key: 'rfid' },
    { title: 'Statut du Forfait', dataIndex: 'statutForfait', key: 'statutForfait' },
    { title: 'Nom de l\'Utilisateur', dataIndex: 'nomUtilisateur', key: 'nomUtilisateur' },
    { title: 'Rôle Utilisateur', dataIndex: 'roleUtilisateur', key: 'roleUtilisateur' }, // Ajout du rôle de l'utilisateur
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
  ];

  return (
    <div className="terminal-manager-container">
      <div className="top-bar">
        <Button icon={<ArrowLeftOutlined />} type="default" onClick={() => navigate('/home')}>
          Retour à la page principale
        </Button>
        <Button icon={<ReloadOutlined />} type="primary" onClick={handleReload} disabled={loading} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Créer un nouveau terminal
        </Button>
      </div>
      <div className="table-container">
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={terminals}
            columns={columns}
            rowKey="macAddress"
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
      </div>

      {/* Modal for terminal creation */}
      <Modal
        title="Créer un nouveau terminal"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateTerminal}>
          <Form.Item
            name="macAddress"
            label="Sélectionner une adresse MAC"
            rules={[{ required: true, message: 'Veuillez sélectionner une adresse MAC' }]}
          >
            <Select placeholder="Sélectionner une adresse MAC">
              {terminals.map((terminal) => (
                <Option key={terminal.macAddress} value={terminal.macAddress}>
                  {terminal.terminalName} - {terminal.macAddress}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="typeTerminal"
            label="Type de Terminal"
            rules={[{ required: true, message: 'Veuillez sélectionner un type de terminal' }]}
          >
            <Select placeholder="Sélectionner le type de terminal">
              <Option value="TPE">TPE</Option>
              <Option value="POS">POS</Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Créer
          </Button>
        </Form>
      </Modal>

      {/* Modal for verification history */}
      <Modal
        title={`Historique de Pointage - ${selectedTerminal?.terminalName}`}
        visible={isVerificationModalVisible}
        onCancel={handleCloseVerificationModal}
        footer={null}
        width="80%"
      >
        {loadingVerifications ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={forfaitVerifications}
            columns={verificationColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
      </Modal>
    </div>
  );
};

export default TerminalManager;
