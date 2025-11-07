import React from 'react';
import { StatusCard } from '../components/StatusCard';
import { Controls } from '../components/Controls';
import { AppMonitorStatus } from '../components/AppMonitorStatus';

export const Home: React.FC = () => {
  return (
    <div className="page-container">
      <StatusCard />
      <AppMonitorStatus />
      <Controls />
    </div>
  );
};

export default Home;
