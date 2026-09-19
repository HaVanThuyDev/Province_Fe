import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import SyncModule from '../modules/SyncModule';

const SyncScreen: React.FC = () => {
  return (
    <DashboardLayout activeModule="sync">
      <SyncModule />
    </DashboardLayout>
  );
};

export default SyncScreen;
