import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AnimatedFormModal from '../../../components/common/AnimatedFormModal';
import EditCitizenForm from '../../../components/forms/EditCitizenForm';

const EditCitizenScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { citizen } = route.params || {};

  return (
    <AnimatedFormModal onClose={() => navigation.goBack()}>
      <EditCitizenForm
        citizen={citizen}
        onClose={() => navigation.goBack()}
        onSuccess={() => navigation.goBack()}
      />
    </AnimatedFormModal>
  );
};

export default EditCitizenScreen;
