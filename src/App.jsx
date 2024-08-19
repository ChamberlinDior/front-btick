import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Page/Home/Home';
import Forfait from './Page/Forfait/Forfait';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forfaits" element={<Forfait />} />
      </Routes>
    </Router>
  );
}

export default App;
