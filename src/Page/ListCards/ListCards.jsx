import React, { useEffect, useState } from 'react';
import { getAllClients, rechargeClientByRfid } from '../../axiosConfig';
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
import './ListCards.css';

const ListCards = () => {
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
      await rechargeClientByRfid(selectedClient.rfid, planType);
      alert('Card recharged successfully');
      setOpen(false);
      setPlanType('');
    } catch (error) {
      alert('Failed to recharge card');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="list-cards-container">
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
      <Grid container spacing={2} className="cards-grid">
        {filteredClients.map((client) => (
          <Grid item key={client.id} xs={12} sm={6} md={4} className="card-grid-item">
            <Card className="card">
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  <Typography variant="h6" component="div" className="card-info">
                    {client.firstName} {client.lastName}
                  </Typography>
                  <Typography color="text.secondary" className="card-info">
                    Email: {client.email}
                  </Typography>
                  <Typography variant="body2" className="card-info">
                    Phone: {client.phoneNumber}
                  </Typography>
                  <Typography variant="body2" className="card-info">
                    District and City: {client.districtCity}
                  </Typography>
                  <Typography variant="body2" className="card-info">
                    Address: {client.address}
                  </Typography>
                  <Typography variant="body2" className="card-info">
                    RFID: {client.rfid}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
                  <Button
                    size="small"
                    variant="contained"
                    className="custom-button"
                    style={{ backgroundColor: '#006400', color: '#fff' }}
                    onClick={() => handleRechargeClick(client)}
                  >
                    Recharger la carte
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Recharge Card</DialogTitle>
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
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecharge} color="primary">
            Recharge
          </Button>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListCards;
