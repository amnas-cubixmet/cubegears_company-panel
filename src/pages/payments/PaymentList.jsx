import React from 'react';
import { CrudResourcePage } from '../../components/common/CrudResourcePage';
import { resourceConfigs } from '../operations/resourceConfigs';

export const PaymentList = () => <CrudResourcePage {...resourceConfigs.payments} />;
export default PaymentList;
