import { Platform } from 'react-native';

// Try importing expo-notifications safely
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch {
  // Fallback if expo-notifications module not loaded
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Failed to get push token for push notification!');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('[Notifications] Expo Push Token:', tokenData.data);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return tokenData.data;
  } catch (err) {
    console.warn('[Notifications] Push registration error:', err);
    return null;
  }
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
  if (!Notifications || !Notifications.scheduleNotificationAsync) {
    console.log(`[LocalNotify Fallback] ${title} - ${body}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // null trigger means show immediately
    });
  } catch (err) {
    console.warn('[Notifications] Error scheduling local notification:', err);
  }
}

export function notifyEscrowFunded(bookingId: string) {
  sendLocalNotification(
    '💰 Escrow Locked & Funded',
    `Booking #${bookingId.slice(-6)} is secured in Escrow. Worker is authorized to travel.`,
    { type: 'escrow_funded', bookingId }
  );
}

export function notifyCheckInVerified(bookingId: string) {
  sendLocalNotification(
    '📸 Arrival Verified via Face ID',
    `Biometric check-in complete for booking #${bookingId.slice(-6)}. Hourly billing started.`,
    { type: 'check_in_verified', bookingId }
  );
}

export function notifyIncomingJob(job: any) {
  sendLocalNotification(
    '⚡ Incoming Rapido Match Request',
    `New ${job.skillCategory || 'Service'} request nearby (~₹${job.totalPrice || job.hourlyRate}). Tap to view.`,
    { type: 'incoming_job', job }
  );
}
