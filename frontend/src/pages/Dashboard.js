import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import HouseholdDashboard from './HouseholdDashboard';
import WorkerDashboard from './WorkerDashboard';

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading user session...</div>;
  }

  if (userInfo.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (userInfo.role === 'worker') {
    return <WorkerDashboard />;
  }

  return <HouseholdDashboard />;
};

export default Dashboard;
