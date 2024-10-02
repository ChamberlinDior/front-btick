import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Modal, Form, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Importation du hook pour la navigation
import axiosInstance from '../../axiosConfig';
import './TerminalManager.css';

const { Option } = Select;

const TerminalManager = () => {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState({});

  const navigate = useNavigate(); // Hook pour la navigation

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

  useEffect(() => {
    fetchTerminals();
  }, [fetchTerminals]);

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
      dataIndex: 'busMatricule',
      key: 'busMatricule',
      render: (text) => (text ? text : 'N/A'), // Optionnel
    },
  ];

  return (
    <div className="terminalmanager-container">
      <div className="top-bar">
        {/* Bouton pour revenir au menu principal */}
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
