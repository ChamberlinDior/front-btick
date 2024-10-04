import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, message, Modal, Form, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom'; // Utilisé pour le bouton retour au menu
import './LigneTrajetManager.css'; // Assurez-vous de créer un fichier CSS approprié

const { Option } = Select;

const LigneTrajetManager = () => {
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate(); // Pour naviguer entre les pages

  const fetchLignes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/lignes');
      setLignes(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des lignes de trajet.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLignes();
  }, [fetchLignes]);

  const handleCreateLigne = async (values) => {
    try {
      const response = await axiosInstance.post('/lignes/create', values);
      message.success('Ligne créée avec succès');
      setLignes([...lignes, response.data]);
      setIsCreationModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Erreur lors de la création de la ligne');
    }
  };

  const villesGabon = [
    'Libreville', 'Port-Gentil', 'Franceville', 'Lambaréné', 'Oyem', 'Moanda',
    'Makokou', 'Koulamoutou', 'Tchibanga', 'Mouila', 'Bitam', 'Ndendé', 'Booué',
    'Lastoursville', 'Mitzic', 'Ndjolé', 'Mayumba', 'Mbigou', 'Omboué', 'Méyokyé'
  ];

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
      title: 'Nom ligne',
      dataIndex: 'nomLigne',
      key: 'nomLigne',
      ...getColumnSearchProps('nomLigne'),
    },
    {
      title: 'Type ligne',
      dataIndex: 'typeLigne',
      key: 'typeLigne',
      ...getColumnSearchProps('typeLigne'),
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      ...getColumnSearchProps('ville'),
    },
  ];

  return (
    <div className="lignetrajetmanager-container">
      <div className="top-bar">
        {/* Bouton pour revenir au menu principal */}
        <Button type="default" onClick={() => navigate('/home')} style={{ marginRight: 8 }}>
          Retour au menu principal
        </Button>
        {/* Ajout du bouton Transaction qui redirige vers la page BusManager */}
        <Button type="primary" onClick={() => navigate('/bus-manager')} style={{ marginRight: 8 }}>
          Transaction
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreationModalVisible(true)}>
          Créer une Ligne
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={fetchLignes} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
      </div>

      <div className="table-container">
        <Table
          dataSource={lignes}
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
        title="Créer une Ligne de Trajet"
        visible={isCreationModalVisible}
        onCancel={() => setIsCreationModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateLigne}>
          <Form.Item
            name="nomLigne"
            label="Nom de la Ligne"
            rules={[{ required: true, message: 'Veuillez saisir le nom de la ligne' }]}
          >
            <Input placeholder="Saisir le nom de la ligne" />
          </Form.Item>

          <Form.Item
            name="typeLigne"
            label="Type de Ligne"
            rules={[{ required: true, message: 'Veuillez sélectionner un type de ligne' }]}
          >
            <Select placeholder="Sélectionner un type">
              <Option value="Urbain">Urbain</Option>
              <Option value="Interurbain">Interurbain</Option>
              <Option value="Rural">Rural</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: true, message: 'Veuillez sélectionner une ville' }]}
          >
            <Select placeholder="Sélectionner une ville">
              {villesGabon.map((ville) => (
                <Option key={ville} value={ville}>
                  {ville}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Créer
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default LigneTrajetManager;
