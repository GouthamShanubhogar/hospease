import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="max-w-7xl mx-auto px-4">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} className="font-semibold text-gray-900">
          <Link to="/">HospEase</Link>
        </Typography>
        <div className="space-x-2">
          <Button component={Link} to="/hospitals" variant="text">Hospitals</Button>
          <Button component={Link} to="/doctors" variant="text">Doctors</Button>
          <Button component={Link} to="/appointments" variant="text">Appointments</Button>
          <Button component={Link} to="/login" variant="contained" color="primary">Login</Button>
          <Button component={Link} to="/register" variant="outlined">Register</Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
