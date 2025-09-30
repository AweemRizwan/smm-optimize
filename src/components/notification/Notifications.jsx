import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import taco from '../../assets/Images/ee2660df9335718b1a80.svg';
import { useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '../../services/api/notificationsApiSlice';
import { taskRoutes } from '../../constants/taskRoutes';
import { Link } from 'react-router-dom';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../../features/notifications/notificationsSlice';

const NotificationComponent = () => {
  const dispatch = useDispatch();
  const [isUnreadOnly, setIsUnreadOnly] = useState(true);

  // Fetch notifications from API
  const { data: apiNotifications = [], isLoading, isError } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();


  // Real-time notifications from Redux
  const notificationsFromStore = useSelector((state) => state.notifications);

  // Mutation for marking notifications as read
  const [markAsRead] = useMarkAsReadMutation();

  // Merge API notifications with real-time notifications
  const allNotifications = useMemo(() => {
    const combined = [...apiNotifications];
    notificationsFromStore.forEach((rtNotification) => {
      const existingIndex = combined.findIndex((apiNotification) => apiNotification.id === rtNotification.id);
      if (existingIndex > -1) {
        combined[existingIndex] = {
          ...combined[existingIndex],
          is_read: combined[existingIndex].is_read || rtNotification.is_read,
        };
      } else {
        combined.push(rtNotification);
      }
    });
    return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by latest
  }, [apiNotifications, notificationsFromStore]);

  // Filter notifications based on unread state
  const filteredNotifications = isUnreadOnly
    ? allNotifications.filter((notification) => !notification.is_read)
    : allNotifications;

  // Toggle between unread and all notifications
  const toggleNotifications = () => {
    setIsUnreadOnly((prevState) => !prevState);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
      dispatch(markNotificationAsRead(notificationId)); // Update Redux store
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle link click to mark notification as read
  const handleLinkClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
  };

  // Generate task link based on task type and client ID
  const getTaskLink = (notification) => {
    const { task_type, client_id } = notification;
    const routeGenerator = taskRoutes[task_type];
    return routeGenerator ? routeGenerator(client_id) : '#'; // Default to '#' if no route
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      dispatch(markAllNotificationsAsRead());
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <div className="position-absolute lg-bg notifications-m">
      {/* Toggle Button */}
      <div className="toggle-container">
        <div className="notification-header d-flex d-flex-space-between border-bottom pb-2 align-center">
          <h3>Notifications</h3>
          <div className="d-flex gap-10">
            <p className="slider-content">
              {isUnreadOnly ? 'Only show unread' : 'Show all notifications'}
            </p>
            <label className="switch">
              <input type="checkbox" checked={isUnreadOnly} onChange={toggleNotifications} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div> 
      <div className="all-notifications">
        <div className="notification-card">
          {isLoading ? (
            <p>Loading notifications...</p>
          ) : isError ? (
            <div className="no-new-notification d-flex flex-direction-column align-center">
              <img className="" src={taco} alt="No notifications" />
              <p>Error loading notifications.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="no-new-notification d-flex flex-direction-column align-center">
              <img className="" src={taco} alt="No notifications" />
              <p>No notifications to show.</p>
            </div>
          ) : (
            <>
              <span className='text-right text-decoration-underline d-block mark-all-read' onClick={handleMarkAllAsRead}>
                Mark all as read
              </span>
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="notification-item d-flex d-flex-space-between">
                  <div className="notification-details">
                    <Link
                      to={getTaskLink(notification)}
                      className="notification-link"
                      onClick={() => handleLinkClick(notification)}
                    >
                      <p className="notification-message">{notification.message}</p>
                    </Link>
                    <p className="notification-client">
                      <strong>{notification.client_name ? "Client" : "Sender"}:</strong>{" "}
                      {notification.client_name || notification.sender_name}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
