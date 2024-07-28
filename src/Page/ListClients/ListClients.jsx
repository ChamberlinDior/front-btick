import React, { useEffect, useState } from 'react';
import { getAllClients, updateClientPlanType } from '../../axiosConfig';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QRCode from 'qrcode.react';
import './ListClients.css';

const ListClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [planType, setPlanType] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getAllClients();
        setClients(response.data);
      } catch (error) {
        setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const firstName = client.firstName?.toLowerCase() || '';
    const lastName = client.lastName?.toLowerCase() || '';
    const email = client.email?.toLowerCase() || '';
    const uniqueId = client.uniqueId?.toLowerCase() || '';

    return (
      firstName.includes(searchQuery.toLowerCase()) ||
      lastName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      uniqueId.includes(searchQuery.toLowerCase())
    );
  });

  const handleRechargeClick = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleRecharge = async () => {
    try {
      const updatedClientData = {
        ...selectedClient,
        planType
      };
      await updateClientPlanType(selectedClient.id, updatedClientData);
      alert('Card recharged successfully');
      setOpen(false);
      setPlanType('');
      setClients(clients.map(client =>
        client.rfid === selectedClient.rfid ? { ...client, planType: updatedClientData.planType } : client
      ));
    } catch (error) {
      alert('Failed to recharge card: ' + (error.response?.data || error.message));
    }
  };

  const handleQRCodeScan = async (rfid) => {
    const client = clients.find(client => client.rfid === rfid);
    if (!client) {
      alert('Cette carte n\'existe pas');
      return;
    }
    if (!client.planType || client.planType === '') {
      alert('Aucun forfait activé');
      return;
    }
    alert(`Forfait activé: ${client.planType}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="list-clients-container">
      <h1>Clients List:</h1>
      <div className="search-bar-container">
        <TextField
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            style: {
              maxWidth: '300px',
              borderRadius: '25px',
              borderColor: '#006400',
            },
          }}
          placeholder="Rechercher..."
          className="search-bar"
        />
        <Typography variant="h6" className="search-label">
          Recherche
        </Typography>
      </div>
      <Grid container spacing={2} className="clients-grid">
        {filteredClients.map((client) => (
          <Grid item key={client.id} xs={12} sm={6} md={4} className="client-grid-item">
            <Card className="client-card">
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  <Typography variant="h6" component="div" className="client-info">
                    {client.firstName} {client.lastName}
                  </Typography>
                  <Typography color="text.secondary" className="client-info">
                    ID: {client.id}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Email: {client.email}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Phone: {client.phoneNumber}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Date of Birth: {client.dateOfBirth}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    District and City: {client.districtCity}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Address: {client.address}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Agent: {client.agent}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Submission Date: {client.submissionDate}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Unique ID: {client.uniqueId}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    RFID: {client.rfid}
                  </Typography>
                  <Typography variant="body2" className="client-info">
                    Plan Type: {client.planType || 'Aucun'}
                  </Typography>
                  <QRCode value={client.rfid} size={50} onClick={() => handleQRCodeScan(client.rfid)} />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  className="custom-button"
                  onClick={() => handleRechargeClick(client)}
                >
                  Recharger/Modifier le Plan
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Recharge/Update Plan</DialogTitle>
        <DialogContent>
          <InputLabel id="plan-type-label">Plan Type</InputLabel>
          <Select
            labelId="plan-type-label"
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            fullWidth
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="">Désactiver le forfait</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRecharge} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListClients;
