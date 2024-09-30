import React, { useState, useEffect } from 'react';
import { Table, Button, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig'; // Assurez-vous que cette configuration est correcte pour appeler l'API
import { ArrowLeftOutlined } from '@ant-design/icons';

const TrajetHistory = () => {
  const [busData, setBusData] = useState(null); // Stocker les données du bus récupérées par l'API
  const [loading, setLoading] = useState(false);
  const { macAddress } = useParams(); // Récupération de l'adresse MAC depuis l'URL
  const navigate = useNavigate();

  // Fonction pour récupérer les données du bus via l'adresse MAC
  const fetchBusData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/buses/mac/${macAddress}`);
      setBusData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du bus :", error);
      message.error("Erreur lors de la récupération des informations du bus.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, [macAddress]);

  // Définir les colonnes pour afficher les informations
  const columns = [
    { title: 'Destination', dataIndex: 'lastDestination', key: 'lastDestination' },
    { title: 'Chauffeur', dataIndex: 'chauffeurNom', key: 'chauffeurNom' },
    { 
      title: 'Début du Trajet', 
      dataIndex: 'debutTrajet', 
      key: 'debutTrajet', 
      render: (text) => text ? new Date(text).toLocaleString() : 'N/A' 
    },
    { 
      title: 'Fin du Trajet', 
      dataIndex: 'finTrajet', 
      key: 'finTrajet', 
      render: (text) => text ? new Date(text).toLocaleString() : 'En cours' 
    },
    { title: 'Niveau de Batterie', dataIndex: 'niveauBatterie', key: 'niveauBatterie' },
    { title: 'En Charge', dataIndex: 'isCharging', key: 'isCharging', render: (charging) => charging ? 'Oui' : 'Non' }
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Retour
      </Button>
      {loading ? (
        <Spin size="large" />
      ) : busData ? (
        <Table
          dataSource={[busData]} // Passer les données du bus dans un tableau
          columns={columns}
          rowKey="macAddress" // Utiliser l'adresse MAC comme clé unique
          pagination={false} // Désactiver la pagination car nous avons un seul bus
          bordered
        />
      ) : (
        <p>Aucune donnée disponible pour ce terminal.</p>
      )}
    </div>
  );
};

export default TrajetHistory;
