import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Modal, Form, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Importation du hook pour la navigation
import axiosInstance from '../../axiosConfig';
import './VehiculeManager.css';

const { Option } = Select;

const VehiculeManager = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [lignes, setLignes] = useState([]); // Trajets disponibles
  const [terminals, setTerminals] = useState([]); // Adresses MAC disponibles
  const [form] = Form.useForm();

  const navigate = useNavigate(); // Hook pour la navigation

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

  // Récupérer les lignes de trajet disponibles
  const fetchLignes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/lignes');
      setLignes(response.data); // Stocker les lignes de trajet
    } catch (error) {
      message.error('Erreur lors de la récupération des lignes de trajet.');
    }
  }, []);

  // Récupérer les terminaux disponibles (adresses MAC)
  const fetchTerminals = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/terminals');
      setTerminals(response.data); // Stocker les adresses MAC
    } catch (error) {
      message.error('Erreur lors de la récupération des terminaux.');
    }
  }, []);

  // Appeler les APIs lors du chargement de la page
  useEffect(() => {
    fetchVehicules();
    fetchLignes();
    fetchTerminals();
  }, [fetchVehicules, fetchLignes, fetchTerminals]);

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
      dataIndex: 'chauffeur',
      key: 'chauffeur',
      ...getColumnSearchProps('chauffeur'),
    },
    {
      title: 'Adresse MAC',
      dataIndex: 'macAddress',
      key: 'macAddress',
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

          {/* Champ pour sélectionner l'adresse MAC */}
          <Form.Item
            name="macAddress"
            label="Adresse MAC"
            rules={[{ required: false, message: 'Veuillez sélectionner une adresse MAC' }]}
          >
            <Select placeholder="Sélectionner une adresse MAC">
              {terminals.map((terminal) => (
                <Option key={terminal.macAddress} value={terminal.macAddress}>
                  {terminal.macAddress}
                </Option>
              ))}
            </Select>
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
