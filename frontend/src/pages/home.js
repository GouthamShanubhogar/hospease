import React from 'react';
import Layout from '../components/Layout';
import Typography from '@mui/material/Typography';

const Home = () => {
  return (
    <Layout>
      <div className="py-12">
        <Typography variant="h3" component="h1" className="mb-4">Welcome to HospEase</Typography>
        <Typography variant="body1">Manage hospitals, doctors and appointments efficiently.</Typography>
      </div>
    </Layout>
  );
};

export default Home;
