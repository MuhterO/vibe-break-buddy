import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Clock, Coffee, Power, PowerOff } from 'lucide-react';

const BreakTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [nextBreakTime, setNextBreakTime] = useState<Date | null>(null);
  const [timeUntilBreak, setTimeUntilBreak] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (nextBreakTime) {
        const diff = nextBreakTime.getTime() - Date.now();
        if (diff > 0) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeUntilBreak(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeUntilBreak('Break Time!');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextBreakTime]);

  const scheduleBreakNotifications = async () => {
    try {
      // Request permission for notifications
      await LocalNotifications.requestPermissions();
      
      // Clear existing notifications
      await LocalNotifications.cancel({ notifications: [] });

      const notifications = [];
      const now = new Date();
      const startTime = new Date();
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(17, 0, 0, 0);

      // If it's past 9 AM today, start from the next 20-minute interval
      let notificationTime = new Date();
      if (now > startTime) {
        // Round up to next 20-minute interval
        const minutes = now.getMinutes();
        const nextInterval = Math.ceil(minutes / 20) * 20;
        notificationTime.setMinutes(nextInterval, 0, 0);
        if (nextInterval >= 60) {
          notificationTime.setHours(notificationTime.getHours() + 1);
          notificationTime.setMinutes(0, 0, 0);
        }
      } else {
        notificationTime = new Date(startTime);
      }

      let id = 1;
      while (notificationTime < endTime) {
        notifications.push({
          title: '🧘 Break Time!',
          body: 'Time for a 5-minute wellness break. Take care of yourself!',
          id: id++,
          schedule: { at: new Date(notificationTime) },
          sound: 'beep.wav',
          actionTypeId: 'BREAK_REMINDER',
          extra: { breakTime: notificationTime.toISOString() }
        });

        // Add 20 minutes for next notification
        notificationTime.setMinutes(notificationTime.getMinutes() + 20);
      }

      await LocalNotifications.schedule({ notifications });
      
      // Set the next break time for display
      if (notifications.length > 0) {
        setNextBreakTime(new Date(notifications[0].schedule.at));
      }

      console.log(`Scheduled ${notifications.length} break reminders`);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const handleToggleTimer = async () => {
    if (!isActive) {
      await scheduleBreakNotifications();
      setIsActive(true);
    } else {
      await LocalNotifications.cancel({ notifications: [] });
      setIsActive(false);
      setNextBreakTime(null);
      setTimeUntilBreak('');
    }
  };

  const handleGotIt = async () => {
    // Stop vibration and dismiss notification
    await Haptics.impact({ style: ImpactStyle.Light });
    console.log('Break acknowledged');
  };

  const isWorkingHours = () => {
    const hour = currentTime.getHours();
    return hour >= 9 && hour < 17;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-wellness rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Break Reminder</h1>
          <p className="text-muted-foreground">Stay healthy with regular breaks</p>
        </div>

        {/* Current Time */}
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-mono font-bold text-foreground">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-muted-foreground">
              {isWorkingHours() ? 'Working Hours' : 'Outside Working Hours'}
            </div>
          </CardContent>
        </Card>

        {/* Timer Status */}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              {isActive ? (
                <Power className="w-5 h-5 text-accent" />
              ) : (
                <PowerOff className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium">
                {isActive ? 'Timer Active' : 'Timer Inactive'}
              </span>
            </div>

            {isActive && nextBreakTime && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Next break in:</div>
                <div className="text-3xl font-mono font-bold text-accent">
                  {timeUntilBreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  at {nextBreakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            <Button
              onClick={handleToggleTimer}
              className={`w-full ${isActive ? 'bg-destructive hover:bg-destructive/90' : 'bg-gradient-wellness'}`}
              size="lg"
            >
              {isActive ? 'Stop Timer' : 'Start Timer'}
            </Button>
          </CardContent>
        </Card>

        {/* Break Acknowledgment */}
        {isActive && (
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-3">When break notification appears:</h3>
              <Button
                onClick={handleGotIt}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                Got it! ✓
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Tap this button to stop vibration
              </p>
            </CardContent>
          </Card>
        )}

        {/* Working Hours Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>⏰ Active: 9:00 AM - 5:00 PM</p>
          <p>⏱️ Break every 20 minutes</p>
          <p>🧘 5-minute wellness breaks</p>
        </div>
      </div>
    </div>
  );
};

export default BreakTimer;