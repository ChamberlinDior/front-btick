import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Page/Home/Home';
import CreateClient from './Page/CreateClient/CreateClient';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-client" element={<CreateClient />} />
      </Routes>
    </Router>
  );
}

export default App;
