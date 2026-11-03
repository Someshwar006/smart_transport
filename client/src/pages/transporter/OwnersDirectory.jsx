import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Building } from 'lucide-react';

const OwnersDirectory = () => {
  return (
    <DirectoryManager
      targetRole="load_owner"
      pageTitle="Industrial Shippers & Load Owners"
      pageSubtitle="Partner directly with manufacturing plants and industrial consignors to unlock regular long-haul freight contracts."
      roleDisplayName="Load Owner"
      icon={Building}
    />
  );
};

export default OwnersDirectory;
