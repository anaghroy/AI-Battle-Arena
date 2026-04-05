import React, { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ChatInterface />
    </div>
  );
}

export default DashboardPage;
