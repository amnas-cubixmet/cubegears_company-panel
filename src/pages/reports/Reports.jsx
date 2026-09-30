import React from 'react';
import { CrudResourcePage } from '../../components/common/CrudResourcePage';
import { resourceConfigs } from '../operations/resourceConfigs';

export const Reports = () => <CrudResourcePage {...resourceConfigs.reports} />;
export default Reports;
