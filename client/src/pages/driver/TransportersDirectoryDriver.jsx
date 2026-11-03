import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Truck } from 'lucide-react';

const TransportersDirectoryDriver = () => {
  return (
    <DirectoryManager
      targetRole="transporter"
      pageTitle="Transporters & Freight Agencies"
      pageSubtitle="Connect with transport companies to unlock their contracted highway loads on your Available feed."
      roleDisplayName="Transporter"
      icon={Truck}
    />
  );
};

export default TransportersDirectoryDriver;
