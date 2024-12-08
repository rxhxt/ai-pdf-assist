import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import GenerateQuestions from './components/GenerateQuestions';
import About from './components/About';
import Keys from './components/Keys';
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Router>
      <div className="container-flex">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<GenerateQuestions />} />
          <Route path="/about" element={<About />} />
          <Route path="/keys" element={<Keys />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;