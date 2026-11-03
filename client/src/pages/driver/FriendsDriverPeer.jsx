import React from 'react';
import DirectoryManager from '../../components/common/DirectoryManager';
import { Users } from 'lucide-react';

const FriendsDriverPeer = () => {
  return (
    <DirectoryManager
      targetRole="driver"
      pageTitle="Driver Brotherhood & Highway Peers"
      pageSubtitle="Connect with fellow lorry drivers running interstate routes for breakdown assistance, toll alerts, and mutual highway aid."
      roleDisplayName="Peer Driver"
      badgeText="Peer Community"
      icon={Users}
    />
  );
};

export default FriendsDriverPeer;
