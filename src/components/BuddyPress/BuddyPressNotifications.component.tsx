import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, BuddyPressNotification } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressNotifications = () => {
  const [notifications, setNotifications] = useState<BuddyPressNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications({
        per_page: 50,
        is_new: filter === 'unread' ? true : undefined,
      });
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const unreadCount = notifications.filter((n) => n.is_new).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="woocommerce-MyAccount-content">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              filter === 'unread'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                notification.is_new ? 'border-l-4 border-l-gray-900' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                  {notification.description && (
                    <p className="text-gray-700 text-sm mb-2">{notification.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(notification.date_notified).toLocaleString()}</span>
                    {notification.is_new && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {notification.url && (
                    <a
                      href={notification.url}
                      className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 underline"
                    >
                      View
                    </a>
                  )}
                  {notification.is_new && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuddyPressNotifications;


