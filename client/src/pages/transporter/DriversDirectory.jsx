import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Truck } from 'lucide-react';

const DriversDirectory = () => {
  return (
    <DirectoryManager
      targetRole="driver"
      pageTitle="Drivers Fleet Directory"
      pageSubtitle="Build your private network of vetted lorry drivers across Indian states for rapid dispatch."
      roleDisplayName="Driver"
      icon={Truck}
    />
  );
};

export default DriversDirectory;
