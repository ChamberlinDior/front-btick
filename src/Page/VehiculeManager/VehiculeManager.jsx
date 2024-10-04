import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Modal, Form, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import './VehiculeManager.css';

const { Option } = Select;

const VehiculeManager = () => {
  const [vehicules, setVehicules] = useState([]);
  const [buses, setBuses] = useState([]); // Récupération des bus pour trouver les chauffeurs
  const [loading, setLoading] = useState(false);
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [lignes, setLignes] = useState([]); // Trajets disponibles
  const [terminals, setTerminals] = useState([]); // Adresses MAC disponibles
  const [form] = Form.useForm();

  const navigate = useNavigate();

  // Récupérer les véhicules
  const fetchVehicules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vehicules');
      setVehicules(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des véhicules.');
      setLoading(false);
    }
  }, []);

  // Récupérer les bus depuis BusManager
  const fetchBuses = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/buses');
      setBuses(response.data); // Stocker les bus pour obtenir les informations du chauffeur
    } catch (error) {
      message.error('Erreur lors de la récupération des bus.');
    }
  }, []);

  // Récupérer les lignes de trajet disponibles
  const fetchLignes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/lignes');
      setLignes(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des lignes de trajet.');
    }
  }, []);

  // Récupérer les terminaux disponibles (adresses MAC)
  const fetchTerminals = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/terminals');
      setTerminals(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des terminaux.');
    }
  }, []);

  // Appeler les APIs lors du chargement de la page
  useEffect(() => {
    fetchVehicules();
    fetchBuses();
    fetchLignes();
    fetchTerminals();
  }, [fetchVehicules, fetchBuses, fetchLignes, fetchTerminals]);

  // Créer un nouveau véhicule
  const handleCreateVehicule = async (values) => {
    try {
      const response = await axiosInstance.post('/vehicules/create', values);
      message.success('Véhicule créé avec succès');
      setVehicules([...vehicules, response.data]);
      setIsCreationModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de la création du véhicule');
    }
  };

  // Fonction pour générer les ID de terminaux (Ter01, Ter02, etc.)
  const getTerminalId = (index) => {
    return `Ter${(index + 1).toString().padStart(2, '0')}`; // Génère Ter01, Ter02, etc.
  };

  // Fonction pour trouver le nom du chauffeur associé au terminal
  const getChauffeurName = (terminalId) => {
    const bus = buses.find((bus) => bus.macAddress === terminalId);
    return bus ? bus.chauffeurNom : 'N/A'; // Retourne le nom du chauffeur ou 'N/A'
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

  // Colonnes de la table
  const columns = [
    {
      title: 'Immatriculation',
      dataIndex: 'immatriculation',
      key: 'immatriculation',
      ...getColumnSearchProps('immatriculation'),
    },
    {
      title: 'Trajet',
      dataIndex: 'trajet',
      key: 'trajet',
      ...getColumnSearchProps('trajet'),
    },
    {
      title: 'Chauffeur',
      dataIndex: 'macAddress', // Utilisation de l'ID terminal pour récupérer le nom du chauffeur
      key: 'chauffeur',
      render: (terminalId) => getChauffeurName(terminalId), // Afficher le nom du chauffeur
    },
    {
      title: 'ID Terminal',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (_, __, index) => getTerminalId(index), // Afficher Ter01, Ter02, etc.
    },
    {
      title: 'Marque',
      dataIndex: 'marque',
      key: 'marque',
      render: (text) => (text ? text : 'N/A'), // Optionnel
    },
  ];

  return (
    <div className="vehiculemanager-container">
      <div className="top-bar">
        {/* Bouton pour revenir au menu principal */}
        <Button type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au menu principal
        </Button>
        {/* Bouton "Transaction" qui redirige vers BusManager */}
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginRight: 8 }}>
          Transaction
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreationModalVisible(true)}>
          Créer un Véhicule
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={fetchVehicules} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
      </div>

      <div className="table-container">
        <Table
          dataSource={vehicules}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          size="middle"
          style={{ backgroundColor: '#f0f2f5', borderRadius: '10px' }}
        />
      </div>

      <Modal
        title="Créer un Véhicule"
        visible={isCreationModalVisible}
        onCancel={() => setIsCreationModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateVehicule}>
          <Form.Item
            name="immatriculation"
            label="Immatriculation"
            rules={[{ required: true, message: 'Veuillez entrer l\'immatriculation du véhicule' }]}
          >
            <Input />
          </Form.Item>

          {/* Champ pour sélectionner le trajet */}
          <Form.Item
            name="trajet"
            label="Trajet"
            rules={[{ required: true, message: 'Veuillez sélectionner un trajet' }]}
          >
            <Select placeholder="Sélectionner un trajet">
              {lignes.map((ligne) => (
                <Option key={ligne.id} value={ligne.nomLigne}>
                  {ligne.nomLigne}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Champ pour sélectionner l'ID terminal */}
          <Form.Item
            name="macAddress"
            label="ID Terminal"
            rules={[{ required: false, message: 'Veuillez sélectionner un ID Terminal' }]}
          >
            <Select placeholder="Sélectionner un ID Terminal">
              {terminals.map((terminal) => (
                <Option key={terminal.macAddress} value={terminal.macAddress}>
                  {getTerminalId(terminals.indexOf(terminal))}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="marque"
            label="Marque"
            rules={[{ required: false, message: 'Veuillez entrer la marque du véhicule (optionnel)' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="chauffeur"
            label="Chauffeur"
            rules={[{ required: false, message: 'Veuillez entrer le nom du chauffeur (optionnel)' }]}
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

export default VehiculeManager;
