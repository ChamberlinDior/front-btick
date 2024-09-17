import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Spin, message, Modal, Form, Input, DatePicker } from 'antd';
import axiosInstance from '../../axiosConfig';
import moment from 'moment';
import QRCode from 'qrcode.react';
import RectoImage from '../../assets/TRANSURB-RECTO.png';
import VersoImage from '../../assets/TRANSURB-VERSO.png';

const generateRFID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let rfid = '';
  for (let i = 0; i < 8; i++) {
    rfid += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return rfid;
};

const formatForfaitForQRCode = (forfait) => {
  if (!forfait || !forfait.name || !forfait.expiration) {
    return 'No active forfait';
  }

  const expirationDate = new Date(forfait.expiration);
  const currentDate = new Date();
  const isActive = expirationDate > currentDate;

  if (!isActive) {
    return 'Forfait expired';
  }

  return `${forfait.name} - Expires on: ${moment(expirationDate).format('DD/MM/YYYY')}`;
};

const CarteAttachePage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchClientDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/clients/${clientId}`);

        if (!response.data.rfid) {
          response.data.rfid = generateRFID();
        }

        setClient(response.data);
      } catch (error) {
        message.error("Erreur lors de la récupération des informations du client.");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const handleShowCard = () => {
    setIsCardVisible(true);
  };

  const handleCardClose = () => {
    setIsCardVisible(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!client) {
    return <p>Aucune information trouvée pour ce client.</p>;
  }

  const qrCodeValue = `${client.rfid} - ${formatForfaitForQRCode(client.forfait)}`;

  return (
    <div className="client-card-details">
      <Button onClick={() => navigate(-1)} type="default" style={{ marginBottom: '20px' }}>
        Retour
      </Button>

      {/* Replacing with the configuration of 'Afficher la Carte' from Home */}
      <Button onClick={handleShowCard} type="primary" style={{ marginBottom: '20px', marginLeft: '10px' }}>
        Afficher Carte du Client
      </Button>

      <Table
        columns={[
          { title: 'RFID du Client', dataIndex: 'rfid', key: 'rfid' },
          { title: 'Nom', dataIndex: 'nom', key: 'nom' },
          { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
          { title: 'Nom de l\'Agent', dataIndex: 'nomAgent', key: 'nomAgent' },
          { title: 'Date de Création', dataIndex: 'dateCreation', key: 'dateCreation', render: (date) => moment(date).format('DD/MM/YYYY') },
        ]}
        dataSource={[client]}
        rowKey="rfid"
      />

      <Modal
        title="Aperçu de la Carte"
        visible={isCardVisible}
        onCancel={handleCardClose}
        footer={[
          <Button key="print" type="primary" onClick={handlePrint}>
            Imprimer les Cartes
          </Button>,
        ]}
        width="100vw"
        style={{ top: 0 }}
        bodyStyle={{ height: '100vh', padding: 0 }}
      >
        <div
          ref={printRef}
          className="print-section"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <div style={{ textAlign: 'center', position: 'relative', marginRight: '20px' }}>
            <h3>Recto de la Carte</h3>
            <img
              src={RectoImage}
              alt="Recto de la carte"
              style={{
                width: '340px',
                height: '214px',
                borderRadius: '15px',
                border: '3px solid black',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '85px',
                left: '110px',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {moment(client.dateCreation).format('DD/MM/YYYY')}
            </div>
            <div
              style={{
                position: 'absolute',
                top: '102px',
                left: '110px',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {client.nom.toLowerCase()} {client.prenom.toLowerCase()}
            </div>
            <div
              style={{
                position: 'absolute',
                top: '85px',
                left: '30px',
              }}
            >
              <QRCode value={qrCodeValue} size={70} level="H" />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3>Verso de la Carte</h3>
            <img
              src={VersoImage}
              alt="Verso de la carte"
              style={{
                width: '340px',
                height: '214px',
                borderRadius: '15px',
                border: '3px solid black',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CarteAttachePage;
