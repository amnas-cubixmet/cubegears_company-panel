import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_API } from '../api/apiConfig';
import { resourceConfigs } from '../pages/operations/resourceConfigs';

const base = resourceConfigs.notifications.service;

const changed = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cubixgear:notifications-changed'));
  }
};

export const notificationInboxService = {
  list: () => base.list(),
  async setRead(row, isRead) {
    const result = USE_MOCK_API
      ? await base.update(row.id, {
          status: isRead ? 'Read' : 'Unread',
          is_read: isRead,
          isRead,
        })
      : isRead
        ? await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${row.id}/read`, {})
        : await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${row.id}`, {
            is_read: false,
            read_at: null,
          });
    changed();
    return result;
  },
  async remove(row) {
    const result = await base.remove(row.id);
    changed();
    return result;
  },
};
