import React, { useEffect, useState } from 'react';
import { useFirebaseUser } from '../hooks/useFirebaseUser';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { type Notification } from '../models/Notification';
import Card from './Card';
import Button from './Button';

export const Notifications: React.FC = () => {
  const { user } = useFirebaseUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      if (!user) {
          setIsLoading(false);
          return;
      }

      const loadNotifications = async () => {
          setIsLoading(true);
          const repo = new NotificationRepository();
          const userNotifications = await repo.getNotificationsByRecipientId(user.uid);
          setNotifications(userNotifications);
          setIsLoading(false);
      };
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);

  }, [user]);

  const handleMarkAsRead = async (id: string) => {
      const repo = new NotificationRepository();
      await repo.markAsRead(id);
      setNotifications(
          notifications.map(n => n.id === id ? { ...n, read: true } : n)
      );
  };
  
  if (isLoading) {
      return <Card title="Notificaciones"><p>Cargando...</p></Card>;
  }
  
  return (
    <Card title="Notificaciones">
      {notifications.length === 0 ? (
        <p>No tienes notificaciones nuevas.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-3 rounded-md ${notification.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                  {notification.createdAt.toLocaleDateString()}
              </p>
              {!notification.read && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleMarkAsRead(notification.id!)}
                >
                    Marcar como leído
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};