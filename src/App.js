import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Page/Home/Home';
import UserManager from './Page/UserManager/UserManager';
import Login from './Page/Login/Login';
import BusManager from './Page/BusManager/BusManager'; // Import du BusManager

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Home />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? (
              <UserManager />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/bus-manager"
          element={
            isAuthenticated ? (
              <BusManager />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
