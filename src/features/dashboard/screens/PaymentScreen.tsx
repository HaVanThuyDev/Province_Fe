import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PaymentModule from '../modules/PaymentModule';

const PaymentScreen: React.FC = () => {
  return (
    <DashboardLayout activeModule="payment">
      <PaymentModule />
    </DashboardLayout>
  );
};

export default PaymentScreen;
