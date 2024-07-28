import React, { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box,
  TextField, InputAdornment, IconButton, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel
} from '@mui/material';
import { Edit, Delete, Search, Save } from '@mui/icons-material';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Home.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Home = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [searchQueries, setSearchQueries] = useState({});
  const [filteredRows, setFilteredRows] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [planType, setPlanType] = useState('');
  const [rechargedClients, setRechargedClients] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/clients');
        const clientsData = response.data.map(client => ({
          ...client,
          status: client.planType ? 'Active' : 'Inactive'
        }));
        setRows(clientsData);
        setFilteredRows(clientsData);
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };

    fetchData();
  }, [location.state]);

  useEffect(() => {
    filterRows();
  }, [searchQueries]);

  const handleSearchChange = (e, column) => {
    setSearchQueries({ ...searchQueries, [column]: e.target.value });
  };

  const filterRows = () => {
    const filtered = rows.filter(row => {
      return Object.keys(searchQueries).every(column => {
        return row[column]?.toString().toLowerCase().includes(searchQueries[column]?.toLowerCase());
      });
    });
    setFilteredRows(filtered);
  };

  const handleDelete = async () => {
    try {
      await Promise.all(
        selectedClients.map((clientId) => axios.delete(`http://localhost:8080/api/clients/${clientId}`))
      );
      setRows(rows.filter((row) => !selectedClients.includes(row.id)));
      setFilteredRows(filteredRows.filter((row) => !selectedClients.includes(row.id)));
      setSelectedClients([]);
    } catch (error) {
      console.error('Failed to delete clients', error);
    }
  };

  const handleSelectClient = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter((id) => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const handleInputChange = (e, clientId, field) => {
    const { value } = e.target;
    setRows(rows.map((row) => (row.id === clientId ? { ...row, [field]: value } : row)));
    setFilteredRows(filteredRows.map((row) => (row.id === clientId ? { ...row, [field]: value } : row)));
  };

  const handleSave = async (clientId) => {
    const client = rows.find((row) => row.id === clientId);
    try {
      await axios.put(`http://localhost:8080/api/clients/${clientId}`, client);
      setEditingClient(null);
      alert('Client mis à jour avec succès');
    } catch (error) {
      console.error('Failed to update client', error);
      alert('Échec de la mise à jour du client');
    }
  };

  const handleRechargeClick = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleRecharge = async () => {
    try {
      const response = await axios.post(`http://localhost:8080/api/cards/recharge-by-rfid`, null, {
        params: { rfid: selectedClient.rfid, planType },
      });
      const updatedClient = response.data;
      alert('Carte rechargée avec succès');
      setOpen(false);
      setPlanType('');
      setRows(rows.map(client =>
        client.rfid === selectedClient.rfid ? { ...client, planType: updatedClient.planType, status: updatedClient.planType ? 'Active' : 'Inactive' } : client
      ));
      setFilteredRows(filteredRows.map(client =>
        client.rfid === selectedClient.rfid ? { ...client, planType: updatedClient.planType, status: updatedClient.planType ? 'Active' : 'Inactive' } : client
      ));
      setRechargedClients([...rechargedClients, selectedClient]);
    } catch (error) {
      console.error('Failed to recharge card', error);
      alert('Échec de la recharge de la carte');
    }
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Total Clients',
        data: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Inscriptions',
        data: [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
        fill: false,
        backgroundColor: 'rgba(248, 207, 57, 0.2)',
        borderColor: 'rgba(248, 207, 57, 1)',
      },
      {
        label: 'Active Cards',
        data: [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140],
        fill: false,
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        borderColor: 'rgba(96, 165, 250, 1)',
      },
    ],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Inscriptions',
        data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(248, 207, 57, 0.2)',
          'rgba(96, 165, 250, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(248, 207, 57, 0.2)',
          'rgba(96, 165, 250, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(248, 207, 57, 0.2)',
          'rgba(96, 165, 250, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(248, 207, 57, 0.2)',
          'rgba(96, 165, 250, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(248, 207, 57, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(248, 207, 57, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(248, 207, 57, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(248, 207, 57, 1)',
          'rgba(96, 165, 250, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        label: 'Card Status',
        data: [
          rows.filter((row) => row.status === 'Active').length,
          rows.filter((row) => row.status === 'Inactive').length,
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="home-container">
      <nav className="vertical-menu">
        <div className="logo-container">
          <img
            src="https://scontent-lga3-1.xx.fbcdn.net/v/t39.30808-6/305807411_498876428909342_684681589345170959_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=uGsHGFNcUq4Q7kNvgE45vjL&_nc_ht=scontent-lga3-1.xx&oh=00_AYCqW8dJ0vHXmkMpn6qw1XF90APlXMyLtdP8Wv5WI40jEQ&oe=66A8DCF9"
            alt="Bus Logo"
            className="logo"
          />
        </div>
        <ul>
          <li className={`menu-section ${activeSection === 'client' ? 'active' : ''}`}>
            <Link to="/create-client" className="menu-item" onClick={() => setActiveSection('client')}>
              Créer un client
            </Link>
            <Link to="/list-clients" className="menu-item" onClick={() => setActiveSection('client')}>
              Gérer les clients existants
            </Link>
          </li>
          <li className={`menu-section ${activeSection === 'carte' ? 'active' : ''}`}>
            <Link to="/list-cards" className="menu-item" onClick={() => setActiveSection('carte')}>
              Gestions des cartes
            </Link>
          </li>
          <li className={`menu-section ${activeSection === 'transaction' ? 'active' : ''}`}>
            <Link to="/transactions" className="menu-item" onClick={() => setActiveSection('transaction')}>
              Analyse et historique
            </Link>
          </li>
          <li className={`menu-section ${activeSection === 'configuration' ? 'active' : ''}`}>
            <Link to="/manage-users" className="menu-item" onClick={() => setActiveSection('configuration')}>
              Gérer les utilisateurs
            </Link>
            <Link to="/manage-tariffs" className="menu-item" onClick={() => setActiveSection('configuration')}>
              Gérer les tarifs
            </Link>
          </li>
          <li className={`menu-section ${activeSection === 'extra' ? 'active' : ''}`}>
            <Link to="/collect-transactions" className="menu-item" onClick={() => setActiveSection('extra')}>
              Collecte des transactions
            </Link>
            <Link to="/update-client-data" className="menu-item" onClick={() => setActiveSection('extra')}>
              Mise à jour des données clients
            </Link>
            <Link to="/receive-recharges" className="menu-item" onClick={() => setActiveSection('extra')}>
              Réception des recharges
            </Link>
            <Link to="/manage-client-accounts" className="menu-item" onClick={() => setActiveSection('extra')}>
              Gestions des comptes clients
            </Link>
            <Link to="/consult-transactions" className="menu-item" onClick={() => setActiveSection('extra')}>
              Consultation des transactions clients
            </Link>
          </li>
          <li>
            <Link to="/logout" className="menu-item logout-button">
              Déconnexion
            </Link>
          </li>
        </ul>
      </nav>
      <div className="dashboard-container">
        <Typography variant="h4" component="h2" className="dashboard-title">
          Tableau de bord
        </Typography>
        <Grid container spacing={3} marginBottom="20px">
          <Grid item xs={4}>
            <Card className="stat-box" style={{ backgroundColor: '#4ade80', color: '#fff' }}>
              <CardContent>
                <Typography className="stat-title">Total Clients</Typography>
                <Typography className="stat-value">{rows.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card className="stat-box" style={{ backgroundColor: '#f8cf39', color: '#fff' }}>
              <CardContent>
                <Typography className="stat-title">Inscriptions</Typography>
                <Typography className="stat-value">{rows.filter((row) => row.status === 'Active').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card className="stat-box" style={{ backgroundColor: '#60a5fa', color: '#fff' }}>
              <CardContent>
                <Typography className="stat-title">Card Status</Typography>
                <Typography className="stat-value">
                  Active: {rows.filter((row) => row.status === 'Active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3} marginBottom="20px">
          <Grid item xs={12} md={6} lg={4}>
            <Card className="chart-box" style={{ border: '2px solid #60a5fa' }}>
              <CardContent>
                <Typography className="chart-title">Total Clients</Typography>
                <div className="chart-container">
                  <Line data={lineData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card className="chart-box" style={{ border: '2px solid #f8cf39' }}>
              <CardContent>
                <Typography className="chart-title">Inscriptions</Typography>
                <div className="chart-container">
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card className="chart-box" style={{ border: '2px solid #4ade80' }}>
              <CardContent>
                <Typography className="chart-title">Card Status</Typography>
                <div className="chart-container">
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-between" marginBottom="20px">
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditingClient(selectedClients[0])}
            disabled={selectedClients.length !== 1}
          >
            Modifier un client
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={selectedClients.length === 0}
          >
            Supprimer
          </Button>
        </Box>
        <Card className="table-card">
          <CardContent>
            <TableContainer component={Paper} className="table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    {['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'agent', 'dateOfBirth', 'submissionDate', 'uniqueId', 'address', 'districtCity', 'rfid', 'totalCards', 'status', 'planType'].map((column) => (
                      <TableCell key={column} className="table-header">
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                        <TextField
                          variant="outlined"
                          size="small"
                          value={searchQueries[column] || ''}
                          onChange={(e) => handleSearchChange(e, column)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                    ))}
                    {editingClient !== null && <TableCell className="table-header">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`table-row ${selectedClients.includes(row.id) ? 'selected' : ''}`}
                      onClick={() => handleSelectClient(row.id)}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.email} onChange={(e) => handleInputChange(e, row.id, 'email')} />
                        ) : (
                          row.email
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.firstName} onChange={(e) => handleInputChange(e, row.id, 'firstName')} />
                        ) : (
                          row.firstName
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.lastName} onChange={(e) => handleInputChange(e, row.id, 'lastName')} />
                        ) : (
                          row.lastName
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.phoneNumber} onChange={(e) => handleInputChange(e, row.id, 'phoneNumber')} />
                        ) : (
                          row.phoneNumber
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.agent} onChange={(e) => handleInputChange(e, row.id, 'agent')} />
                        ) : (
                          row.agent
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.dateOfBirth} onChange={(e) => handleInputChange(e, row.id, 'dateOfBirth')} />
                        ) : (
                          row.dateOfBirth
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.submissionDate} onChange={(e) => handleInputChange(e, row.id, 'submissionDate')} />
                        ) : (
                          row.submissionDate
                        )}
                      </TableCell>
                      <TableCell>{row.uniqueId}</TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.address} onChange={(e) => handleInputChange(e, row.id, 'address')} />
                        ) : (
                          row.address
                        )}
                      </TableCell>
                      <TableCell>
                        {editingClient === row.id ? (
                          <TextField value={row.districtCity} onChange={(e) => handleInputChange(e, row.id, 'districtCity')} />
                        ) : (
                          row.districtCity
                        )}
                      </TableCell>
                      <TableCell>{row.rfid}</TableCell>
                      <TableCell>{row.totalCards}</TableCell>
                      <TableCell>
                        <div className={`status-bar ${row.status.toLowerCase()}`}>
                          <span className="status-label">{row.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.planType}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          className="custom-button"
                          style={{ backgroundColor: '#006400', color: '#fff' }}
                          onClick={() => handleRechargeClick(row)}
                        >
                          Recharger la carte
                        </Button>
                      </TableCell>
                      {editingClient === row.id && (
                        <TableCell>
                          <IconButton onClick={() => handleSave(row.id)}>
                            <Save />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        <Grid container spacing={3} marginBottom="20px">
          <Grid item xs={12}>
            <Card className="recharged-clients-box" style={{ border: '2px solid #4ade80' }}>
              <CardContent>
                <Typography className="recharged-clients-title">Clients avec cartes rechargées</Typography>
                {rechargedClients.length > 0 ? (
                  <ul>
                    {rechargedClients.map((client) => (
                      <li key={client.id}>
                        {client.firstName} {client.lastName} - RFID: {client.rfid}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>Aucun client n'a rechargé sa carte</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Recharge/Update Plan</DialogTitle>
        <DialogContent>
          <InputLabel id="plan-type-label">Plan Type</InputLabel>
          <Select labelId="plan-type-label" value={planType} onChange={(e) => setPlanType(e.target.value)} fullWidth>
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

export default Home;
