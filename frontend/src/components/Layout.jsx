import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:flex">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto p-4 md:ml-64">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
