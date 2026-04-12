import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { localDb, type NotificationRow } from '../../lib/localDb';

type Notification = NotificationRow;

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const data = await localDb.listNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await localDb.markNotificationRead(notificationId);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const all = await localDb.listNotifications(user.id);
    await Promise.all(all.filter((n) => !n.is_read).map((n) => localDb.markNotificationRead(n.id)));

    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'case_request':
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      case 'payment':
        return <IndianRupee className="w-6 h-6 text-green-600" />;
      case 'hearing':
        return <Calendar className="w-6 h-6 text-orange-600" />;
      case 'message':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'document':
        return <FileText className="w-6 h-6 text-slate-600" />;
      default:
        return <Bell className="w-6 h-6 text-slate-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.is_read : true
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  notification.is_read
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-slate-700">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-4" />
                      )}
                    </div>
                  </div>

                  {notification.is_read && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
