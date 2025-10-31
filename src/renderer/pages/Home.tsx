import React from 'react';
import { StatusCard } from '../components/StatusCard';
import { Controls } from '../components/Controls';

export const Home: React.FC = () => {
  return (
    <div className="page-container">
      <StatusCard />
      <Controls />
    </div>
  );
};

export default Home;
