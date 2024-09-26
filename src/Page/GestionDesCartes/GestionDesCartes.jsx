import React, { useState, useEffect } from 'react';
import { Table, Spin, message, Button, Input } from 'antd';
import { ReloadOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import moment from 'moment';
import 'moment/locale/fr'; // Import du français pour moment.js
import './GestionDesCartes.css'; // Le fichier CSS pour styliser la page

moment.locale('fr'); // Configurer le français pour moment.js

const GestionDesCartes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients(); // Récupérer les clients
  }, []);

  // Fonction pour récupérer les informations des clients et l'historique des forfaits pour afficher la date d'activation
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/clients'); // Récupérer tous les clients
      const clientsData = await Promise.all(
        response.data.map(async (client) => {
          const dernierPointage = await fetchDerniereDateActivation(client.id);
          return {
            ...client,
            nomAgent: client.nomAgent || 'Agent inconnu',
            dateFinValidite: client.dateCreation
              ? moment(client.dateCreation).add(3, 'years').format('dddd D MMMM YYYY') // Afficher en lettres
              : 'N/A',
            dernierPointage, // Dernière date d'activation du forfait en lettres (sans l'heure)
            statut: 'actif',
          };
        })
      );
      setClients(clientsData);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des clients.');
      setLoading(false);
    }
  };

  // Fonction pour récupérer la dernière date d'activation d'un forfait pour chaque client et la formater en lettres (sans heure)
  const fetchDerniereDateActivation = async (clientId) => {
    try {
      const response = await axiosInstance.get(`/forfaits/historique/${clientId}`);
      const forfaitHistory = response.data;

      if (forfaitHistory && forfaitHistory.length > 0) {
        const dernierForfait = forfaitHistory.sort(
          (a, b) => new Date(b.dateActivation) - new Date(a.dateActivation)
        )[0]; // Récupérer le dernier forfait activé

        // Retourner la date en lettres, par exemple "Mardi 26 Septembre 2023" (sans heure)
        return moment(dernierForfait.dateActivation).format('dddd D MMMM YYYY');
      } else {
        return 'Aucune activation trouvée';
      }
    } catch (error) {
      message.error(`Erreur lors de la récupération de l'historique des forfaits pour le client ${clientId}.`);
      return 'Aucune activation trouvée';
    }
  };

  // Fonction pour appliquer un filtre sur les colonnes
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
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
  });

  // Colonnes du tableau
  const columns = [
    {
      title: 'Numéro du Client',
      dataIndex: 'numClient',
      key: 'numClient',
      ...getColumnSearchProps('numClient'),
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      ...getColumnSearchProps('nom'),
    },
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
      ...getColumnSearchProps('prenom'),
    },
    {
      title: 'Date de Pointage',
      dataIndex: 'dernierPointage',
      key: 'dernierPointage',
      render: (text) => <span>{text}</span>, // Afficher la date d'activation en lettres sans l'heure
    },
    {
      title: 'Date de Fin de Validité',
      dataIndex: 'dateFinValidite',
      key: 'dateFinValidite',
      render: (text) => <span>{text}</span>, // Affichage de la date de fin de validité en lettres
    },
    {
      title: 'Nom de l\'Agent',
      dataIndex: 'nomAgent',
      key: 'nomAgent',
      ...getColumnSearchProps('nomAgent'),
    },
  ];

  // Rafraîchir les données
  const handleRefresh = () => {
    fetchClients();
    message.success('Données mises à jour avec succès !');
  };

  return (
    <div className="gestion-cartes-page">
      <div className="top-bar">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}>
          Retour
        </Button>
        <Button icon={<ReloadOutlined />} type="default" onClick={handleRefresh}>
          Rafraîchir
        </Button>
      </div>

      <h1>Gestion des Cartes</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={clients}
          columns={columns}
          rowKey="numClient"
          bordered
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default GestionDesCartes;
