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

  // Liste des lignes de trajet (noms de lignes)
  const lignesDeTrajet = [
    'Okala - Charbonnage',
    'PK5 - PJK12',
    'Gros Bouquet - Lalala',
    'Belle Vue - Gare routière',
    'Louis - Nzeng Ayong',
    'Dragages - Montagne Sainte',
    'Owendo - Alibandeng',
    'Angondje - Mindoumbé',
    'Ambowé - Kangu',
    'Carrefour Léon - PK9',
    'Cité de la Démocratie - Mindoumbé',
    'Akébé - Kinguelé',
    'Kinguelé - Belle Vue',
    'Petit Paris - PK8',
    'PK7 - Owendo',
    'Sni Owendo - Akanda',
    'PK12 - Gare routière',
    'Montagne Sainte - Nzeng Ayong',
    'Montalier - Carrefour Léon',
    'Nzeng Ayong - Okala'
  ];

  // Liste des villes du Gabon
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
          {/* Champ de sélection du nom de la ligne */}
          <Form.Item
            name="nomLigne"
            label="Nom de la Ligne"
            rules={[{ required: true, message: 'Veuillez sélectionner un trajet' }]}
          >
            <Select placeholder="Sélectionner un trajet">
              {lignesDeTrajet.map((trajet) => (
                <Option key={trajet} value={trajet}>
                  {trajet}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Champ de sélection du type de ligne */}
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

          {/* Champ de sélection de la ville */}
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
