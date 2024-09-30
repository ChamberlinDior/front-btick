import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Input, Table, message, Form, DatePicker, Select, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBatteryThreeQuarters, faBatteryHalf, faBatteryQuarter, faBatteryFull, faBolt } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import './BusManager.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BusManager = () => {
  const [isCreationModalVisible, setIsCreationModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [selectedBusHistory, setSelectedBusHistory] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busHistories, setBusHistories] = useState({});
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const navigate = useNavigate();

  const marques = ['Toyota', 'Mercedes', 'Renault', 'Iveco'];
  const immatriculations = ['ABC-123-GA', 'XYZ-456-LB', 'JKL-789-CT', 'MNO-234-DP'];
  const modelesToyota = ['Coaster', 'Hiace'];
  const modelesMercedes = ['Sprinter', 'Citaro'];
  const modelesRenault = ['Master', 'Traffic'];
  const modelesIveco = ['Daily', 'Urbanway'];

  const [selectedMarque, setSelectedMarque] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  const handleMarqueChange = (value) => {
    setSelectedMarque(value);
    switch (value) {
      case 'Toyota':
        setAvailableModels(modelesToyota);
        break;
      case 'Mercedes':
        setAvailableModels(modelesMercedes);
        break;
      case 'Renault':
        setAvailableModels(modelesRenault);
        break;
      case 'Iveco':
        setAvailableModels(modelesIveco);
        break;
      default:
        setAvailableModels([]);
        break;
    }
  };

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/buses', { params: filter });
      const busData = response.data;

      const macToTerminalMap = {};
      let terminalCounter = 1;

      const updatedBusData = busData.map((bus) => {
        const macAddress = bus.macAddress;
        const debutTrajet = new Date(bus.debutTrajet);
        const finTrajet = bus.finTrajet ? new Date(bus.finTrajet) : null;

        if (finTrajet && debutTrajet > finTrajet) {
          bus.finTrajet = '';
        }

        if (!macToTerminalMap[macAddress]) {
          macToTerminalMap[macAddress] = `Terminal ${terminalCounter}`;
          terminalCounter += 1;
        }

        return {
          ...bus,
          terminalName: macToTerminalMap[macAddress],
          key: bus.id,
        };
      });

      setBusHistories((prevHistories) => {
        const updatedHistories = { ...prevHistories };
        updatedBusData.forEach((bus) => {
          const macAddress = bus.macAddress;
          if (!updatedHistories[macAddress]) {
            updatedHistories[macAddress] = [];
          }
          updatedHistories[macAddress] = [bus, ...updatedHistories[macAddress]];
        });
        return updatedHistories;
      });

      setBuses(updatedBusData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching buses: ", error);
      message.error("Erreur lors de la récupération des bus.");
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleCreateBus = async (values) => {
    try {
      const response = await axiosInstance.post('/buses/create', values);
      message.success('Bus créé avec succès');
      setBuses((prevBuses) => [...prevBuses, { ...response.data, key: response.data.id, finTrajet: '' }]);
      setIsCreationModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating bus: ", error);
      message.error('Erreur lors de la création du bus');
    }
  };

  const handleViewBusHistory = (bus) => {
    setSelectedBus(bus);
    const history = busHistories[bus.macAddress] || [];
    setSelectedBusHistory(history);
    setIsHistoryModalVisible(true);
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    editForm.setFieldsValue({
      modele: '',
      matricule: '',
      marque: '',
      terminalName: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await editForm.validateFields();
      const newData = [...buses];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const updatedBus = { ...item, ...row };

        const debutTrajet = new Date(updatedBus.debutTrajet);
        const finTrajet = updatedBus.finTrajet ? new Date(updatedBus.finTrajet) : null;

        if (finTrajet && debutTrajet > finTrajet) {
          updatedBus.finTrajet = '';
        }

        newData.splice(index, 1, updatedBus);
        setBuses(newData);
        setEditingKey('');

        await axiosInstance.put(`/buses/${item.id}`, updatedBus);
        message.success("Bus mis à jour avec succès.");
      } else {
        setEditingKey('');
      }
    } catch (errInfo) {
      message.error('Erreur lors de la mise à jour du bus.');
    }
  };

  const getColumnSearchProps = (dataIndex, color) => ({
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
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    render: (text) => <span style={{ color }}>{text}</span>,
  });

  const renderBatteryIcon = (niveauBatterie, isCharging) => {
    let icon = faBatteryFull;
    let color = 'green';

    if (niveauBatterie <= 25) {
      icon = faBatteryQuarter;
      color = 'red';
    } else if (niveauBatterie <= 50) {
      icon = faBatteryHalf;
      color = 'orange';
    } else if (niveauBatterie <= 75) {
      icon = faBatteryThreeQuarters;
      color = 'yellow';
    }

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <FontAwesomeIcon icon={icon} style={{ color }} />
        {isCharging && (
          <FontAwesomeIcon
            icon={faBolt}
            style={{
              color: 'white',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'Modèle',
      dataIndex: 'modele',
      key: 'modele',
      editable: true,
      ...getColumnSearchProps('modele', '#87d068'),
    },
    {
      title: 'Immatriculation',
      dataIndex: 'matricule',
      key: 'matricule',
      editable: true,
      ...getColumnSearchProps('matricule', '#108ee9'),
    },
    {
      title: 'Marque',
      dataIndex: 'marque',
      key: 'marque',
      editable: true,
      ...getColumnSearchProps('marque', '#ff6f61'),
    },
    {
      title: 'Dernière Destination',
      dataIndex: 'lastDestination',
      key: 'lastDestination',
      ...getColumnSearchProps('lastDestination', '#fadb14'),
    },
    {
      title: 'Nom du Chauffeur',
      dataIndex: 'chauffeurNom',
      key: 'chauffeurNom',
      ...getColumnSearchProps('chauffeurNom', '#42e6a4'),
    },
    {
      title: 'Numéro Unique du Chauffeur',
      dataIndex: 'chauffeurUniqueNumber',
      key: 'chauffeurUniqueNumber',
      ...getColumnSearchProps('chauffeurUniqueNumber', '#1890ff'),
    },
    {
      title: 'Début du Trajet',
      dataIndex: 'debutTrajet',
      key: 'debutTrajet',
      render: (text) => (text ? new Date(text).toLocaleString() : 'N/A'),
    },
    {
      title: 'Fin du Trajet',
      dataIndex: 'finTrajet',
      key: 'finTrajet',
      render: (text) => (text ? new Date(text).toLocaleString() : ''),  // Si pas encore terminée, case vide
    },
    {
      title: 'Nom du Terminal',
      dataIndex: 'terminalName',
      key: 'terminalName',
      editable: true,
      ...getColumnSearchProps('terminalName', '#f50'),
    },
    {
      title: 'Niveau de Batterie',
      dataIndex: 'niveauBatterie',
      key: 'niveauBatterie',
      render: (niveauBatterie, record) =>
        niveauBatterie !== null ? (
          <div>
            {renderBatteryIcon(niveauBatterie, record.isCharging)} <span>{niveauBatterie}%</span>
          </div>
        ) : (
          'N/A'
        ),
    },
    {
      title: 'Voir Historique',
      key: 'history',
      render: (_, bus) => (
        <Button type="primary" onClick={() => handleViewBusHistory(bus)}>
          Voir Historique
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.key)} type="link" style={{ marginRight: 8 }}>
              Sauvegarder
            </Button>
            <Popconfirm title="Êtes-vous sûr d'annuler ?" onConfirm={cancel}>
              <Button type="link">Annuler</Button>
            </Popconfirm>
          </span>
        ) : (
          <Button disabled={editingKey !== ''} onClick={() => edit(record)} type="link">
            Modifier
          </Button>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className="busmanager-container">
      <div className="top-bar">
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreationModalVisible(true)}>
          Créer un Bus
        </Button>
        <Button type="primary" onClick={() => navigate('/gestion-transactions')} style={{ marginLeft: 8 }}>
          Gestion des Transactions
        </Button>
        <Button type="primary" onClick={() => navigate('/users')} style={{ marginLeft: 8 }}>
          Gestion des Utilisateurs
        </Button>
        <Button type="primary" onClick={() => navigate('/')} style={{ marginLeft: 8 }}>
          Gestion des Clients
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={fetchBuses} style={{ marginLeft: 8 }}>
          Rafraîchir
        </Button>
        <RangePicker onChange={(dates, dateStrings) => setFilter({ dates: dateStrings })} style={{ marginLeft: 8 }} />
      </div>
      <div className="table-container">
        <Form form={editForm} component={false}>
          <Table
            components={{
              body: {
                cell: ({ editing, dataIndex, title, children, ...restProps }) => {
                  const inputNode = <Input />;
                  return (
                    <td {...restProps}>
                      {editing ? (
                        <Form.Item
                          name={dataIndex}
                          style={{ margin: 0 }}
                          rules={[{ required: true, message: `Veuillez entrer ${title}!` }]}
                        >
                          {inputNode}
                        </Form.Item>
                      ) : (
                        children
                      )}
                    </td>
                  );
                },
              },
            }}
            dataSource={buses}
            columns={mergedColumns}
            rowClassName="editable-row"
            rowKey="key"
            loading={loading}
            bordered
            pagination={{ pageSize: 10 }}
            size="middle"
            style={{ backgroundColor: '#f0f2f5', borderRadius: '10px' }}
          />
        </Form>
      </div>

      <Modal
        title="Créer un Bus"
        visible={isCreationModalVisible}
        onCancel={() => setIsCreationModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateBus}>
          <Form.Item
            name="marque"
            label="Marque"
            rules={[{ required: true, message: 'Veuillez sélectionner la marque' }]}
          >
            <Select placeholder="Sélectionner une marque" onChange={handleMarqueChange}>
              {marques.map((marque) => (
                <Option key={marque} value={marque}>
                  {marque}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="modele"
            label="Modèle"
            rules={[{ required: true, message: 'Veuillez sélectionner le modèle' }]}
          >
            <Select placeholder="Sélectionner un modèle" disabled={!selectedMarque}>
              {availableModels.map((modele) => (
                <Option key={modele} value={modele}>
                  {modele}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="matricule"
            label="Immatriculation"
            rules={[{ required: true, message: 'Veuillez sélectionner une immatriculation' }]}
          >
            <Select placeholder="Sélectionner une immatriculation">
              {immatriculations.map((immatriculation) => (
                <Option key={immatriculation} value={immatriculation}>
                  {immatriculation}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="macAddress"
            label="Adresse MAC du TPE"
            rules={[{ required: true, message: 'Veuillez entrer l\'adresse MAC du TPE' }]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Créer
          </Button>
        </Form>
      </Modal>

      <Modal
        title={`Historique du bus (Nom : ${selectedBus?.terminalName})`}
        visible={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        footer={null}
        width="80%"
      >
        <Table
          dataSource={selectedBusHistory}
          columns={[
            { title: 'Modèle', dataIndex: 'modele', key: 'modele', ...getColumnSearchProps('modele', '#87d068') },
            { title: 'Immatriculation', dataIndex: 'matricule', key: 'matricule', ...getColumnSearchProps('matricule', '#108ee9') },
            { title: 'Marque', dataIndex: 'marque', key: 'marque', ...getColumnSearchProps('marque', '#ff6f61') },
            { title: 'Dernière Destination', dataIndex: 'lastDestination', key: 'lastDestination', ...getColumnSearchProps('lastDestination', '#fadb14') },
            { title: 'Nom du Chauffeur', dataIndex: 'chauffeurNom', key: 'chauffeurNom', ...getColumnSearchProps('chauffeurNom', '#42e6a4') },
            { title: 'Début du Trajet', dataIndex: 'debutTrajet', key: 'debutTrajet', render: (text) => text ? new Date(text).toLocaleString() : 'N/A' },
            { title: 'Fin du Trajet', dataIndex: 'finTrajet', key: 'finTrajet', render: (text) => text ? new Date(text).toLocaleString() : '' },
            { title: 'Nom du Terminal', dataIndex: 'terminalName', key: 'terminalName', ...getColumnSearchProps('terminalName', '#f50') },
          ]}
          rowKey={(record) => `${record.macAddress}-${record.debutTrajet}`}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
};

export default BusManager;
