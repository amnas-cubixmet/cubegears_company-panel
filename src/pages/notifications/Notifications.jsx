import React from 'react';
import { CrudResourcePage } from '../../components/common/CrudResourcePage';
import { resourceConfigs } from '../operations/resourceConfigs';

export const Notifications = () => <CrudResourcePage {...resourceConfigs.notifications} />;
export default Notifications;
