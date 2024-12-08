import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button } from '@mui/material';

const Navbar = () => (
  <AppBar position="static" sx={{ backgroundColor: '#f5f5f5' }}>
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          component={Link} 
          to="/"
          variant="outlined" 
          sx={{ color: 'black', borderColor: 'black' }}
        >
          Home
        </Button>
        <Button 
          component={Link} 
          to="/generate"
          variant="outlined" 
          sx={{ color: 'black', borderColor: 'black' }}
        >
          Generate Questions
        </Button>
        <Button 
          component={Link} 
          to="/about"
          variant="outlined" 
          sx={{ color: 'black', borderColor: 'black' }}
        >
          About
        </Button>
        {/* <Button 
          component={Link} 
          to="/keys"
          variant="outlined" 
          sx={{ color: 'black', borderColor: 'black' }}
        >
          Keys
        </Button> */}
      </Box>
    </Toolbar>
  </AppBar>
);

export default Navbar;
