import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { darkTheme } from './theme/darkTheme';
import { Navbar } from './Page/Navbar/Navbar';
import Home from './Page/Home/Home';
import CreateClient from './Page/CreateClient/CreateClient';
import CheckCardValidity from './Page/CheckCardValidity/CheckCardValidity';
import ListClients from './Page/ListClients/ListClients';
import ListCards from './Page/ListCards/ListCards';
import AssignRFID from './Page/AssignRFID/AssignRFID';
import './App.css';

function App() {
  const [rechargedClients, setRechargedClients] = useState([]);

  const handleRecharge = (client) => {
    setRechargedClients([...rechargedClients, client]);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home rechargedClients={rechargedClients} />} />
              <Route path="/create-client" element={<CreateClient />} />
              <Route path="/check-card-validity" element={<CheckCardValidity />} />
              <Route path="/list-clients" element={<ListClients onRecharge={handleRecharge} />} />
              <Route path="/list-cards" element={<ListCards />} />
              <Route path="/assign-rfid" element={<AssignRFID />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
