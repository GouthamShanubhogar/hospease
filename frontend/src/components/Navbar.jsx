import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="max-w-7xl mx-auto px-4">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} className="font-semibold text-gray-900">
          <Link to="/">HospEase</Link>
        </Typography>
        <div className="space-x-2 flex items-center">
          {user ? (
            <>
              <Button component={Link} to="/dashboard" variant="text">Dashboard</Button>
              <Button component={Link} to="/hospitals" variant="text">Hospitals</Button>
              {hasRole(['admin', 'doctor', 'staff']) && (
                <Button component={Link} to="/patients" variant="text">Patients</Button>
              )}
              {hasRole(['admin', 'staff']) && (
                <>
                  <Button component={Link} to="/doctors" variant="text">Doctors</Button>
                  <Button component={Link} to="/wards" variant="text">Wards</Button>
                  <Button component={Link} to="/billing" variant="text">Billing</Button>
                  <Button component={Link} to="/reception" variant="text">Reception</Button>
                </>
              )}
              <Button component={Link} to="/appointments" variant="text">Appointments</Button>
              <NotificationBell />
              
              <IconButton onClick={handleMenuClick}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    Signed in as {user.name}
                  </Typography>
                </MenuItem>
                <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="contained" color="primary">Login</Button>
              <Button component={Link} to="/register" variant="outlined">Register</Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
