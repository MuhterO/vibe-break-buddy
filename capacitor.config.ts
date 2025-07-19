import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.e4b56a983bcb46068d98fcafde6d46f2',
  appName: 'Break Reminder',
  webDir: 'dist',
  server: {
    url: 'https://e4b56a98-3bcb-4606-8d98-fcafde6d46f2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;