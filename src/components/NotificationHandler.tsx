import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const NotificationHandler = () => {
  useEffect(() => {
    const setupNotificationListeners = async () => {
      // Listen for when notifications are received
      await LocalNotifications.addListener('localNotificationReceived', async (notification) => {
        console.log('Notification received:', notification);
        
        // Start vibration pattern for break reminder
        if (notification.actionTypeId === 'BREAK_REMINDER') {
          // Continuous vibration until acknowledged
          const vibrationInterval = setInterval(async () => {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          }, 500);

          // Store interval ID to clear it later
          (window as any).breakVibrationInterval = vibrationInterval;
        }
      });

      // Listen for when notification actions are performed
      await LocalNotifications.addListener('localNotificationActionPerformed', async (notificationAction) => {
        console.log('Notification action performed:', notificationAction);
        
        // Stop vibration when user interacts with notification
        if ((window as any).breakVibrationInterval) {
          clearInterval((window as any).breakVibrationInterval);
          (window as any).breakVibrationInterval = null;
        }
      });
    };

    setupNotificationListeners();

    return () => {
      // Cleanup vibration interval if component unmounts
      if ((window as any).breakVibrationInterval) {
        clearInterval((window as any).breakVibrationInterval);
        (window as any).breakVibrationInterval = null;
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationHandler;