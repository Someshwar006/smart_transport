import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Truck } from 'lucide-react';

const FriendsDrivers = () => {
  return (
    <DirectoryManager
      targetRole="driver"
      pageTitle="Drivers (Friends) Directory"
      pageSubtitle="Build direct mutual connections with vetted lorry drivers across Indian national corridors."
      roleDisplayName="Driver"
      icon={Truck}
    />
  );
};

export default FriendsDrivers;
