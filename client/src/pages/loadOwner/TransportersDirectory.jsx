import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Truck } from 'lucide-react';

const TransportersDirectory = () => {
  return (
    <DirectoryManager
      targetRole="transporter"
      pageTitle="Transporters Directory"
      pageSubtitle="Connect with certified fleet operators. Only connected transporters can view and accept your open freight loads."
      roleDisplayName="Transporter"
      icon={Truck}
    />
  );
};

export default TransportersDirectory;
